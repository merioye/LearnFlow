import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { ApiResponse } from '@/common/utils';
import { CustomParseIntPipe } from '@/core/pipes';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { UserEntity } from '@/database';

import { TOffsetPaginatedResult } from '@/types';
import { ENDPOINTS } from '@/constants';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserDto, GetUserListDto, UpdateUserDto } from './dtos';
import { UsersService } from './services';
import { TUserWithoutPassword } from './types';

@Controller(ENDPOINTS.User.Base)
export class UsersController {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _usersService: UsersService
  ) {}

  /**
   * Create user endpoint
   * @param {CreateUserDto} input - User details
   * @returns {Promise<ApiResponse<TUserWithoutPassword>>} The created user details
   */
  @Public()
  @Post(ENDPOINTS.User.Post.CreateUser)
  public async createUser(
    @Body() input: CreateUserDto
  ): Promise<ApiResponse<TUserWithoutPassword>> {
    this._logger.debug('Create user request', {
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        role: input.role,
        password: '******',
      },
    });

    const createdUser = await this._usersService.createOne(input);

    this._logger.info('User created successfully', {
      data: {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      },
    });

    return new ApiResponse({
      message: 'User created successfully',
      result: createdUser,
      statusCode: HttpStatus.CREATED,
    });
  }

  @Get(ENDPOINTS.User.Get.UserList)
  public async getUserList(
    @Query() input: GetUserListDto
  ): Promise<
    ApiResponse<
      TUserWithoutPassword[] | TOffsetPaginatedResult<TUserWithoutPassword>
    >
  > {
    this._logger.debug('Get user list request', {
      data: input,
    });

    const users = await this._usersService.findAll(input);

    return new ApiResponse({
      message: 'Data fetched successfully',
      result: users,
      statusCode: HttpStatus.OK,
    });
  }

  @Get(ENDPOINTS.User.Get.SingleUser)
  public async getUser(
    @Param('userId', CustomParseIntPipe) userId: number
  ): Promise<ApiResponse<TUserWithoutPassword | null>> {
    this._logger.debug('Get user request', {
      data: {
        userId,
      },
    });

    const { password: _, ...restUserDetails } =
      (await this._usersService.findOne({ filter: { id: userId } })) ||
      ({} as UserEntity);

    return new ApiResponse({
      message: 'Data fetched successfully',
      result: restUserDetails || null,
      statusCode: HttpStatus.OK,
    });
  }

  @Put(ENDPOINTS.User.Put.UpdateUser)
  public async updateUser(
    @Param('userId', CustomParseIntPipe) userId: number,
    @Body() input: UpdateUserDto,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<TUserWithoutPassword>> {
    const loggerMetadata = {
      userId,
      ...input,
      by: currentUserId,
    };
    this._logger.debug('Update user request', {
      data: loggerMetadata,
    });

    const user = await this._usersService.updateOne(userId, input);

    this._logger.info('User updated successfully', {
      data: loggerMetadata,
    });

    return new ApiResponse({
      message: 'User updated successfully',
      result: user,
      statusCode: HttpStatus.OK,
    });
  }

  @Delete(ENDPOINTS.User.Delete.DeleteUser)
  public async deleteUser(
    @Param('userId', CustomParseIntPipe) userId: number,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<null>> {
    const loggerMetadata = {
      userId,
      by: currentUserId,
    };
    this._logger.debug('Delete user request', {
      data: loggerMetadata,
    });

    await this._usersService.deleteById({ id: userId });

    this._logger.info('User deleted successfully', {
      data: loggerMetadata,
    });

    return new ApiResponse({
      message: 'User deleted successfully',
      result: null,
      statusCode: HttpStatus.OK,
    });
  }
}
