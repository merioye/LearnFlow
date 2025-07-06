import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ILike } from 'typeorm';

import { BadRequestError, NotFoundError } from '@/common/errors';
import { IHashService, InjectHashService } from '@/modules/common/hash';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { TTypeOrmFilterQuery, TTypeOrmSort, UserEntity } from '@/database';
import { BaseTypeOrmService } from '@/database/services';

import { TOffsetPaginatedResult } from '@/types';
import { Role } from '@/enums';

import { FileStatus, FileTrackingService } from '../../storage';
import { CreateUserDto, GetUserListDto, UpdateUserDto } from '../dtos';
import { UserStatus } from '../enums';
import { TUserWithoutPassword } from '../types';

@Injectable()
export class UsersService extends BaseTypeOrmService<UserEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource,
    @InjectLogger() private readonly _logger: ILogger,
    @InjectHashService() private readonly _hashService: IHashService,
    private readonly _fileTrackingService: FileTrackingService
  ) {
    super(dateTime, dataSource, UserEntity, {
      softDelete: false,
    });
  }

  public async createOne(input: CreateUserDto): Promise<TUserWithoutPassword> {
    const { firstName, lastName, email, password, role } = input;
    const existingUser = await this.findOne({ filter: { email } });
    if (existingUser) {
      throw new BadRequestError('User already exists');
    }

    const hashedPassword = await this._hashService.hash(password);
    const { password: _, ...restUserDetails } = await this.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role ?? Role.STUDENT,
        lastLoginAt: null,
        profileUrl: null,
        status: UserStatus.ACTIVE,
        payments: [],
      },
    });

    return restUserDetails;
  }

  public async findAll(
    input: GetUserListDto
  ): Promise<
    TUserWithoutPassword[] | TOffsetPaginatedResult<TUserWithoutPassword>
  > {
    const { limit, page, search, role, status, withoutPagination, sortBy } =
      input;
    const whereConditions: TTypeOrmFilterQuery<UserEntity> = [];

    // Build base conditions for role and status
    const baseCondition: { role?: Role; status?: UserStatus } = {};
    if (role) {
      baseCondition.role = role;
    }
    if (status) {
      baseCondition.status = status;
    }

    // If search is provided, create OR conditions for firstName, lastName, email
    if (search) {
      const searchPattern = ILike(`%${search}%`);

      whereConditions.push(
        { ...baseCondition, firstName: searchPattern },
        { ...baseCondition, lastName: searchPattern },
        { ...baseCondition, email: searchPattern }
      );
    } else {
      // If no search, just use base conditions
      whereConditions.push(baseCondition);
    }

    const filter: TTypeOrmFilterQuery<UserEntity> =
      whereConditions.length > 1 ? whereConditions : whereConditions[0] || {};

    const sort: TTypeOrmSort<UserEntity> = {
      ...Object.keys(sortBy).reduce((acc, key) => {
        acc[key as keyof UserEntity] = sortBy[key];
        return acc;
      }, {} as TTypeOrmSort<UserEntity>),
    };

    if (withoutPagination) {
      return this.findMany({
        filter,
        sort,
      });
    }

    return this.paginateOffset({
      pagination: {
        limit,
        page,
        withoutPagination,
        sortBy,
      },
      filter,
      sort,
    });
  }

  public async updateOne(
    userId: number,
    input: UpdateUserDto
  ): Promise<TUserWithoutPassword> {
    const queryRunner = await this.startTransaction();
    try {
      const isUserExists = await this.findById({ id: userId });
      if (!isUserExists) {
        throw new NotFoundError('User not found');
      }

      const { password: _, ...restUserDetails } = await this.updateById({
        id: userId,
        data: { $set: { ...input, payments: isUserExists.payments } },
        options: { queryRunner },
      });

      if (input.profileUrl && isUserExists.profileUrl !== input.profileUrl) {
        await this._fileTrackingService.updateMany({
          filter: { ownerId: userId, filePath: input.profileUrl },
          data: {
            $set: {
              status: FileStatus.ACTIVE,
              lastReferencedAt: this.dateTime.toUTC(this.dateTime.timestamp),
            },
            $inc: {
              referenceCount: 1,
            },
          },
          options: { queryRunner },
        });
      }
      await this.commitTransaction(queryRunner);

      return restUserDetails;
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      this._logger.error('Error updating user', { error });
      throw error;
    }
  }

  public async deleteOne(userId: number): Promise<void> {
    const queryRunner = await this.startTransaction();
    try {
      const deletedUser = await this.deleteById({
        id: userId,
        options: { queryRunner },
      });

      if (deletedUser.profileUrl) {
        await this._fileTrackingService.updateMany({
          filter: { ownerId: userId, filePath: deletedUser.profileUrl },
          data: {
            $inc: {
              referenceCount: -1,
            },
          },
          options: { queryRunner },
        });
      }
      await this.commitTransaction(queryRunner);
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      this._logger.error('Error deleting user', { error });
      throw error;
    }
  }
}
