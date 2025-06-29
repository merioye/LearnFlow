import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BadRequestError, NotFoundError } from '@/common/errors';
import { CourseEntity, UserEntity } from '@/database/entities';
import { BaseTypeOrmService } from '@/database/services/base-typeorm.service';
import { FileStatus } from '@/modules/app/storage/enums';
import { FileTrackingService } from '@/modules/app/storage/services';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { DataSource, ILike, QueryRunner } from 'typeorm';

import { TTypeOrmFilterQuery, TTypeOrmSort } from '@/database';

import { TOffsetPaginatedResult } from '@/types';
import { SortDirection } from '@/enums';

import { CreateCourseDto, GetCourseListDto, UpdateCourseDto } from '../dtos';
import { CourseLevel, CourseStatus } from '../enums';

/**
 * Service for handling course-related operations
 *
 * @class CoursesService
 * @extends {BaseTypeOrmService}
 */
@Injectable()
export class CoursesService extends BaseTypeOrmService<CourseEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource,
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _fileTrackingService: FileTrackingService
  ) {
    super(dateTime, dataSource, CourseEntity, {
      defaultRelations: {
        teacher: true,
      },
      defaultSort: {
        createdAt: SortDirection.DESC,
      },
      softDelete: false,
    });
  }

  /**
   * Creates a new course
   * @param teacherId - ID of the teacher creating the course
   * @param input - Course data
   * @returns The created course
   */
  public async createCourse(
    teacherId: number,
    input: CreateCourseDto
  ): Promise<CourseEntity> {
    const queryRunner = await this.startTransaction();
    try {
      const courseData = {
        ...input,
        teacherId,
        teacher: { id: teacherId } as UserEntity,
        totalEnrollments: 0,
        publishedAt: null,
        description: input.description || '',
        thumbnailPath: input.thumbnailPath || null,
        level: input.level || CourseLevel.BEGINNER,
        status: input.status || CourseStatus.DRAFT,
        tags: input.tags || [],
      };

      // Create the course
      const course = await this.create({
        data: courseData,
        options: { queryRunner },
      });

      // If there's a thumbnail, update its tracking
      if (input.thumbnailPath) {
        await this._updateThumbnailTracking(
          teacherId,
          input.thumbnailPath,
          queryRunner
        );
      }

      await this.commitTransaction(queryRunner);
      return course;
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      this._logger.error('Error creating course', { error });
      throw error;
    }
  }

  /**
   * Finds all courses with optional filtering and pagination
   * @param input - Filtering and pagination options
   * @returns List of courses or paginated result
   */
  public async findAllCourses(
    input: GetCourseListDto
  ): Promise<CourseEntity[] | TOffsetPaginatedResult<CourseEntity>> {
    const {
      search,
      category,
      level,
      status,
      teacherId,
      withoutPagination,
      sortBy,
      page,
      limit,
    } = input;

    // Build the filter conditions
    const whereConditions: TTypeOrmFilterQuery<CourseEntity> = [];

    // Base condition
    const baseCondition: Record<string, any> = {};
    if (category) baseCondition.category = category;
    if (level) baseCondition.level = level;
    if (status) baseCondition.status = status;
    if (teacherId) baseCondition.teacherId = teacherId;

    // Add search condition if provided
    if (search) {
      const searchPattern = ILike(`%${search}%`);

      whereConditions.push(
        { ...baseCondition, title: searchPattern },
        { ...baseCondition, description: searchPattern },
        { ...baseCondition, tags: searchPattern }
      );
    } else if (Object.keys(baseCondition).length > 0) {
      // If no search, just use base conditions
      whereConditions.push(baseCondition);
    }

    const filter: TTypeOrmFilterQuery<CourseEntity> =
      whereConditions.length > 1 ? whereConditions : whereConditions[0] || {};

    // Build sort
    const sort: TTypeOrmSort<CourseEntity> = {
      ...Object.keys(sortBy).reduce((acc, key) => {
        acc[key as keyof CourseEntity] = sortBy[key];
        return acc;
      }, {} as TTypeOrmSort<CourseEntity>),
    };

    // Execute query with or without pagination
    if (withoutPagination) {
      return this.findMany({
        filter,
        sort,
      });
    }

    return this.paginateOffset({
      pagination: { page, limit, sortBy, withoutPagination },
      filter,
      sort,
    });
  }

  /**
   * Finds a course by ID
   * @param id - Course ID
   * @returns The course if found
   * @throws NotFoundError if course is not found
   */
  public async findCourseById(id: number): Promise<CourseEntity> {
    const course = await this.findById({
      id,
    });
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return course;
  }

  /**
   * Updates a course
   * @param id - Course ID
   * @param input - Course data to update
   * @param userId - ID of the user performing the update
   * @returns The updated course
   */
  public async updateCourse(
    id: number,
    input: UpdateCourseDto,
    userId: number
  ): Promise<CourseEntity> {
    const queryRunner = await this.startTransaction();
    try {
      // Check if course exists and user is the owner
      const course = await this.findCourseById(id);

      if (course.teacherId !== userId) {
        throw new BadRequestError(
          'You are not authorized to update this course'
        );
      }

      // Check if trying to publish the course
      let publishedAt = course.publishedAt;
      if (
        input.status === CourseStatus.PUBLISHED &&
        course.status !== CourseStatus.PUBLISHED
      ) {
        publishedAt = this.dateTime.toUTC(this.dateTime.now());
      }

      // Update the course
      const updatedCourse = await this.updateById({
        id,
        data: { $set: { ...input, publishedAt } },
        options: { queryRunner },
      });

      // Handle thumbnail update if needed
      if (input.thumbnailPath && input.thumbnailPath !== course.thumbnailPath) {
        await this._updateThumbnailTracking(
          userId,
          input.thumbnailPath,
          queryRunner
        );
      }

      await this.commitTransaction(queryRunner);
      return updatedCourse;
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      this._logger.error('Error updating course', {
        error,
        data: { courseId: id },
      });
      throw error;
    }
  }

  /**
   * Deletes a course
   * @param id - Course ID
   * @param userId - ID of the user performing the deletion
   */
  public async deleteCourse(id: number, userId: number): Promise<void> {
    const queryRunner = await this.startTransaction();
    try {
      // Check if course exists and user is the owner
      const course = await this.findCourseById(id);

      if (course.teacherId !== userId) {
        throw new BadRequestError(
          'You are not authorized to delete this course'
        );
      }

      // Delete the course
      await this.deleteById({
        id,
        options: { queryRunner },
      });

      // Clean up thumbnail tracking if exists
      if (course.thumbnailPath) {
        await this._fileTrackingService.updateMany({
          filter: { ownerId: userId, filePath: course.thumbnailPath },
          data: {
            $inc: { referenceCount: -1 },
          },
          options: { queryRunner },
        });
      }

      await this.commitTransaction(queryRunner);
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      this._logger.error('Error deleting course', {
        error,
        data: { courseId: id },
      });
      throw error;
    }
  }

  /**
   * Updates the enrollment count for a course
   * @param courseId - Course ID
   * @param increment - Whether to increment (true) or decrement (false) the count
   */
  public async updateEnrollmentCount(
    courseId: number,
    increment: boolean
  ): Promise<void> {
    try {
      await this.updateById({
        id: courseId,
        data: {
          $inc: { totalEnrollments: increment ? 1 : -1 },
        },
      });
    } catch (error) {
      this._logger.error('Error updating enrollment count', {
        error,
        data: { courseId, increment },
      });
      throw error;
    }
  }

  /**
   * Updates the thumbnail tracking for a course
   * @param courseId - Course ID
   * @param thumbnailPath - Path to the thumbnail
   * @param queryRunner - Optional query runner for transactions
   */
  private async _updateThumbnailTracking(
    userId: number,
    thumbnailPath: string | null,
    queryRunner?: QueryRunner
  ): Promise<void> {
    if (!thumbnailPath) return;

    await this._fileTrackingService.updateMany({
      filter: { ownerId: userId, filePath: thumbnailPath },
      data: {
        $set: {
          status: FileStatus.ACTIVE,
          lastReferencedAt: this.dateTime.toUTC(this.dateTime.timestamp),
        },
        $inc: { referenceCount: 1 },
      },
      options: { queryRunner },
    });
  }
}
