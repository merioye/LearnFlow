import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BadRequestError, NotFoundError } from '@/common/errors';
import { BaseTypeOrmService } from '@/database/services';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { DataSource, In } from 'typeorm';

import { PermissionEntity, UserPermissionEntity, UserStatus } from '@/database';

import { UsersService } from '../../users';
import { AssignUserPermissionDto } from '../dtos';
import { PermissionsService } from './permissions.service';

/**
 * Service for managing user permissions.
 * This service handles assigning, retrieving, and revoking permissions for users.
 *
 * @class UserPermissionsService
 * @extends {BaseTypeOrmService}
 */
@Injectable()
export class UserPermissionsService extends BaseTypeOrmService<UserPermissionEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource,
    private readonly _usersService: UsersService,
    private readonly _permissionsService: PermissionsService
  ) {
    super(dateTime, dataSource, UserPermissionEntity, {
      softDelete: false,
    });
  }

  /**
   * Assigns permissions to a user.
   *
   * @param {AssignUserPermissionDto} input - The data containing the user ID and permission IDs.
   * @returns {Promise<UserPermissionEntity[]>} - The assigned permissions.
   * @throws {NotFoundError} If the user is not found.
   */
  public async assign(
    input: AssignUserPermissionDto
  ): Promise<UserPermissionEntity[]> {
    // Check if user exists and is active
    const user = await this._usersService.findById({ id: input.userId });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestError('User is not active');
    }

    // Check all permissions that exist
    const foundPermissions = await this._permissionsService.findMany({
      filter: {
        id: In(input.permissionIds),
      },
    });

    // Create permissions in batch
    const createData = foundPermissions.map((permission) => ({
      userId: user.id,
      user,
      permissionId: permission.id,
      permission,
    }));

    // Use transaction to ensure all or nothing
    const queryRunner = await this.startTransaction();
    try {
      await this.deleteMany({
        filter: { userId: user.id },
        options: { queryRunner },
      });
      const createdPermissions = await this.createMany({
        dataArray: createData,
        options: { queryRunner },
      });
      await this.commitTransaction(queryRunner);

      return createdPermissions;
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      throw error;
    }
  }

  /**
   * Retrieves all permissions assigned to a user.
   *
   * @param {number} userId - The ID of the user.
   * @returns {Promise<PermissionEntity[]>} - A list of permissions.
   */
  public async findAll(userId: number): Promise<PermissionEntity[]> {
    // Check if user exists and is active
    const user = await this._usersService.findById({ id: userId });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestError('User is not active');
    }

    const userPermissions = await this.findMany({
      filter: { userId },
      relations: { permission: true },
    });

    return userPermissions.map((userPermission) => userPermission.permission);
  }

  /**
   * Revokes a specific permission from a user.
   *
   * @param {number} userId - The ID of the user.
   * @param {number} permissionId - The ID of the permission to revoke.
   * @returns {Promise<void>}
   * @throws {NotFoundError} If the user or permission is not found.
   */
  public async revoke(userId: number, permissionId: number): Promise<void> {
    // Check if user exists and is active
    const user = await this._usersService.findById({ id: userId });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestError('User is not active');
    }

    // Check if permission exists
    const permission = await this._permissionsService.findById({
      id: permissionId,
    });
    if (!permission) {
      throw new NotFoundError('Permission not found');
    }

    // Revoke permission
    await this.deleteMany({ filter: { userId, permissionId } });
  }
}
