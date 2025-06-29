import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '@/common/utils';
import { CustomParseIntPipe } from '@/core/pipes';
import { CourseEntity } from '@/database/entities';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { TOffsetPaginatedResult } from '@/types';
import { Role } from '@/enums';
import { ENDPOINTS } from '@/constants';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateCourseDto, GetCourseListDto, UpdateCourseDto } from './dtos';
import { CoursesService } from './services';

/**
 * Controller for handling course-related operations
 *
 * @class CoursesController
 */
@Controller(ENDPOINTS.Course.Base)
export class CoursesController {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _coursesService: CoursesService
  ) {}

  @Post(ENDPOINTS.Course.Post.CreateCourse)
  @Roles(Role.TEACHER)
  public async createCourse(
    @CurrentUser('userId') currentUserId: number,
    @Body() input: CreateCourseDto
  ): Promise<ApiResponse<CourseEntity>> {
    this._logger.debug('Creating new course', {
      data: {
        ...input,
        by: currentUserId,
      },
    });

    const createdCourse = await this._coursesService.createCourse(
      currentUserId,
      input
    );

    this._logger.info('Created course', {
      data: {
        courseId: createdCourse.id,
      },
    });

    return new ApiResponse({
      message: 'Course created successfully',
      result: createdCourse,
      statusCode: HttpStatus.CREATED,
    });
  }

  @Public()
  @Get(ENDPOINTS.Course.Get.CourseList)
  public async getCourses(
    @Query() input: GetCourseListDto
  ): Promise<
    ApiResponse<CourseEntity[] | TOffsetPaginatedResult<CourseEntity>>
  > {
    this._logger.debug('Fetching courses', { data: input });

    const courses = await this._coursesService.findAllCourses(input);

    return new ApiResponse({
      message: 'Data fetched successfully',
      result: courses,
      statusCode: HttpStatus.OK,
    });
  }

  @Public()
  @Get(ENDPOINTS.Course.Get.CourseById)
  public async getCourseById(
    @Param('id', CustomParseIntPipe) courseId: number
  ): Promise<ApiResponse<CourseEntity>> {
    this._logger.debug('Fetching course by ID', { data: { courseId } });

    const course = await this._coursesService.findCourseById(courseId);

    return new ApiResponse({
      message: 'Data fetched successfully',
      result: course,
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(ENDPOINTS.Course.Put.UpdateCourse)
  @Roles(Role.TEACHER)
  public async updateCourse(
    @Param('id', CustomParseIntPipe) courseId: number,
    @Body() input: UpdateCourseDto,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<CourseEntity>> {
    this._logger.debug('Updating course', {
      data: {
        courseId,
        ...input,
        by: currentUserId,
      },
    });

    const course = await this._coursesService.updateCourse(
      courseId,
      input,
      currentUserId
    );

    this._logger.info('Updated course', {
      data: {
        courseId: course.id,
      },
    });

    return new ApiResponse({
      message: 'Course updated successfully',
      result: course,
      statusCode: HttpStatus.OK,
    });
  }

  @Delete(ENDPOINTS.Course.Delete.DeleteCourse)
  @Roles(Role.TEACHER, Role.ADMIN)
  public async deleteCourse(
    @Param('id', CustomParseIntPipe) courseId: number,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<null>> {
    this._logger.debug('Deleting course', {
      data: { courseId, by: currentUserId },
    });

    await this._coursesService.deleteCourse(courseId, currentUserId);

    this._logger.info('Course deleted', {
      data: {
        courseId,
      },
    });

    return new ApiResponse({
      message: 'Course deleted successfully',
      result: null,
      statusCode: HttpStatus.OK,
    });
  }

  @Post(ENDPOINTS.Course.Post.EnrollInCourse)
  @Roles(Role.STUDENT)
  public enrollInCourse(
    @Param('id', CustomParseIntPipe) courseId: number,
    @CurrentUser('userId') currentUserId: number
  ): string {
    this._logger.debug('Enrolling in course', {
      data: { courseId, by: currentUserId },
    });
    // Implementation would go here, likely in a separate service
    return 'OK';
  }
}
