import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BadRequestError } from '@/common/errors';
import { IHashService, InjectHashService } from '@/modules/common/hash';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { DataSource, ILike } from 'typeorm';

import {
  BaseTypeOrmService,
  TTypeOrmFilterQuery,
  TTypeOrmSort,
  UserEntity,
  UserStatus,
} from '@/database';

import { TOffsetPaginatedResult } from '@/types';
import { Role } from '@/enums';

import { CreateUserDto, GetUserListDto } from '../dtos';
import { TUserWithoutPassword } from '../types';

@Injectable()
export class UsersService extends BaseTypeOrmService<UserEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource,
    @InjectHashService() private readonly _hashService: IHashService
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
}
