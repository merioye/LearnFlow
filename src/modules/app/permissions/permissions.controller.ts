import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '@/common/utils';
import { CustomParseIntPipe } from '@/core/pipes';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import {
  PermissionEntity,
  PermissionGroupEntity,
  UserPermissionEntity,
} from '@/database';

import { TOffsetPaginatedResult } from '@/types';
import { ENDPOINTS } from '@/constants';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AssignUserPermissionDto, GetPermissionListDto } from './dtos';
import {
  PermissionGroupsService,
  PermissionsService,
  UserPermissionsService,
} from './services';

/**
 * Controller for managing user permissions
 * @class PermissionsController
 */
@Controller(ENDPOINTS.Permission.Base)
export class PermissionsController {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _permissionsService: PermissionsService,
    private readonly _permissionGroupsService: PermissionGroupsService,
    private readonly _userPermissionsService: UserPermissionsService
  ) {}

  /**
   * Assigns permissions to a user
   * @param {AssignUserPermissionDto} input - Permission data
   * @param {number} userId - The currently logged in user ID
   * @returns {Promise<ApiResponse<UserPermissionEntity[]>>} Assigned permissions
   */
  @Post(ENDPOINTS.Permission.Post.AssignPermissionsToUser)
  // @RequirePermission({
  //   resource: Resource.ADMIN_PERMISSION,
  //   action: Action.UPDATE,
  // })
  public async assignPermissionsToUser(
    @Body() input: AssignUserPermissionDto,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<UserPermissionEntity[]>> {
    this._logger.debug('Assigning permissions to user', {
      data: {
        ...input,
        by: currentUserId,
      },
    });

    const userPermissions = await this._userPermissionsService.assign(input);

    this._logger.info('Assigned permissions to user: ', {
      data: {
        permissions: userPermissions,
        by: currentUserId,
      },
    });

    return new ApiResponse({
      message: 'Permissions assigned successfully',
      result: userPermissions,
      statusCode: HttpStatus.CREATED,
    });
  }

  /**
   * Revokes a permission from a user
   * @param {number} userId - User ID
   * @param {number} permissionId - Permission ID
   * @param {number} currentUserId - The currently logged in user ID
   * @returns {Promise<ApiResponse<null>>}
   */
  @Delete(ENDPOINTS.Permission.Delete.RevokePermissionFromUser)
  // @RequirePermission({
  //   resource: Resource.ADMIN_PERMISSION,
  //   action: Action.DELETE,
  // })
  public async revokePermissionFromUser(
    @Param('userId', CustomParseIntPipe) userId: number,
    @Param('permissionId', CustomParseIntPipe) permissionId: number,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<null>> {
    const loggerMetadata = {
      data: {
        userId,
        permissionId,
        by: currentUserId,
      },
    };
    this._logger.debug('Revoking permission from user', loggerMetadata);

    await this._userPermissionsService.revoke(userId, permissionId);

    this._logger.info('Revoked permission from user', loggerMetadata);

    return new ApiResponse({
      message: 'Permission revoked successfully',
      result: null,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Retrieves a list of all available permissions
   * @param {GetPermissionListDto} input - Query parameters
   * @returns {Promise<ApiResponse<PermissionEntity[] | TOffsetPaginatedResult<PermissionEntity>>>} List of permissions
   */
  @Get(ENDPOINTS.Permission.Get.PermissionList)
  // @RequirePermission({
  //   resource: Resource.PERMISSION,
  //   action: Action.READ,
  // })
  public async getPermissionList(
    @Query() input: GetPermissionListDto
  ): Promise<
    ApiResponse<PermissionEntity[] | TOffsetPaginatedResult<PermissionEntity>>
  > {
    this._logger.info('Fetching all permissions', { data: input });

    const permissionList = await this._permissionsService.findAll(input);

    return new ApiResponse({
      message: 'Data fetched successfully',
      result: permissionList,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Retrieves a list of all available permission groups
   * @param {GetPermissionListDto} input - Query parameters
   * @returns {Promise<ApiResponse<PermissionGroupEntity[] | TOffsetPaginatedResult<PermissionGroupEntity>>>} List of permission groups
   */
  @Get(ENDPOINTS.Permission.Get.PermissionGroupList)
  // @RequirePermission({
  //   resource: Resource.PERMISSION_GROUP,
  //   action: Action.READ,
  // })
  public async getPermissionGroupList(
    @Query() input: GetPermissionListDto
  ): Promise<
    ApiResponse<
      PermissionGroupEntity[] | TOffsetPaginatedResult<PermissionGroupEntity>
    >
  > {
    this._logger.info('Fetching all permission groups', { data: input });

    const permissionGroupList =
      await this._permissionGroupsService.findAll(input);

    return new ApiResponse({
      message: 'Data fetched successfully',
      result: permissionGroupList,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Retrieves a list of permissions assigned to a user
   * @param {number} userId - User ID
   * @returns {Promise<ApiResponse<PermissionEntity[]>>} List of permissions
   */
  @Get(ENDPOINTS.Permission.Get.UserPermissions)
  // @RequirePermission({
  //   resource: Resource.ADMIN_PERMISSION,
  //   action: Action.READ,
  // })
  public async getAdminPermissions(
    @Param('userId', CustomParseIntPipe) userId: number
  ): Promise<ApiResponse<PermissionEntity[]>> {
    this._logger.info('Fetching user permissions', { data: { userId } });

    const userPermissions = await this._userPermissionsService.findAll(userId);

    return new ApiResponse({
      message: 'Data fetched successfully',
      result: userPermissions,
      statusCode: HttpStatus.OK,
    });
  }
}
