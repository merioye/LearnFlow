import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner } from 'typeorm';

import { BadRequestError, NotFoundError } from '@/common/errors';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { PermissionEntity, SubscriptionTierEntity } from '@/database';
import { BaseTypeOrmService } from '@/database/services';

import { SortDirection } from '@/enums';

import { PermissionsService } from '../../permissions';
import { CreateSubscriptionTierDto, UpdateSubscriptionTierDto } from '../dtos';
import { SubscriptionTiersPermissionsService } from './subscription-tiers-permissions.service';

/**
 * Service for managing subscription tiers
 *
 * @class SubscriptionTiersService
 * @extends {BaseTypeOrmService}
 */
@Injectable()
export class SubscriptionTiersService extends BaseTypeOrmService<SubscriptionTierEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource,
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _subscriptionTiersPermissionsService: SubscriptionTiersPermissionsService,
    private readonly _permissionsService: PermissionsService
  ) {
    super(dateTime, dataSource, SubscriptionTierEntity, {
      defaultRelations: {
        tierPermissions: {
          permission: true,
        },
      },
      defaultSort: {
        sortOrder: SortDirection.ASC,
        price: SortDirection.ASC,
      } as const,
    });
  }

  /**
   * Create a new subscription tier
   * @param input - Subscription tier data
   * @returns Created subscription tier
   */
  public async createOne(
    input: CreateSubscriptionTierDto
  ): Promise<SubscriptionTierEntity> {
    const { permissions = [], ...tierData } = input;

    const isAlreadyExists = await this.findOne({
      filter: { tierCode: input.tierCode },
    });
    if (isAlreadyExists) {
      throw new BadRequestError(
        `Subscription tier with tierCode "${isAlreadyExists.tierCode}" already exists`
      );
    }

    const queryRunner = await this.startTransaction();
    try {
      // Create the subscription tier
      const subscriptionTier = await this.create({
        data: { ...tierData, tierPermissions: [] },
        options: { queryRunner },
      });

      // Add permissions if provided
      if (permissions.length > 0) {
        await this._addPermissionsToTier(
          subscriptionTier.id,
          permissions.map((p) => p.permissionId),
          queryRunner
        );
      }

      await this.commitTransaction(queryRunner);

      return subscriptionTier;
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      this._logger.error('Error creating subscription tier', { error });
      throw error;
    }
  }

  /**
   * Update an existing subscription tier
   * @param id - Subscription tier ID
   * @param input - Subscription tier data
   * @returns Updated subscription tier
   */
  public async updateOne(
    id: number,
    input: UpdateSubscriptionTierDto
  ): Promise<SubscriptionTierEntity> {
    const { permissions, ...tierData } = input;

    const subscriptionTier = await this.findById({
      id,
    });
    if (!subscriptionTier) {
      throw new NotFoundError('Subscription tier not found');
    }

    const queryRunner = await this.startTransaction();
    try {
      // Update the subscription tier
      await this.updateById({
        id,
        data: tierData,
        options: { queryRunner },
      });

      // Update permissions if provided
      if (permissions) {
        // Remove existing permissions
        await this._subscriptionTiersPermissionsService.deleteMany({
          filter: { subscriptionTierId: id },
          options: { queryRunner },
        });

        // Add new permissions
        if (permissions.length > 0) {
          await this._addPermissionsToTier(
            id,
            permissions.map((p) => p.permissionId),
            queryRunner
          );
        }
      }

      await this.commitTransaction(queryRunner);

      // Return the updated tier with permissions
      return this.findById({
        id,
        options: {
          relations: {
            tierPermissions: {
              permission: true,
            },
          },
        },
      }) as Promise<SubscriptionTierEntity>;
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      this._logger.error('Error updating subscription tier', { error });
      throw error;
    }
  }

  /**
   * Get all subscription tiers
   * @returns List of subscription tiers
   */
  public async findAll(): Promise<SubscriptionTierEntity[]> {
    return this.findMany();
  }

  /**
   * Delete a subscription tier by ID
   * @param id - Subscription tier ID
   * @returns Deleted subscription tier
   */
  public async deleteOne(id: number): Promise<SubscriptionTierEntity> {
    const subscriptionTier = await this.findById({
      id,
    });
    if (!subscriptionTier) {
      throw new NotFoundError('Subscription tier not found');
    }

    const queryRunner = await this.startTransaction();
    try {
      // First, delete the tier permissions
      await this._subscriptionTiersPermissionsService.deleteMany({
        filter: {
          subscriptionTierId: id,
        },
        options: { queryRunner },
      });

      // Then delete the tier itself
      const result = await this.deleteById({ id, options: { queryRunner } });

      await this.commitTransaction(queryRunner);
      return result;
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      this._logger.error('Error deleting subscription tier', { error });
      throw error;
    }
  }

  /**
   * Add permissions to a subscription tier
   * @param tierId - Subscription tier ID
   * @param permissionIds - Permission IDs
   * @param queryRunner - Query runner instance
   * @returns {Promise<void>}
   */
  private async _addPermissionsToTier(
    tierId: number,
    permissionIds: number[],
    queryRunner: QueryRunner
  ): Promise<void> {
    if (permissionIds.length === 0) return;

    // Verify all permission IDs exist
    const existingPermissions = await this._permissionsService.findMany({
      filter: { id: In(permissionIds) },
      select: {
        id: true,
      },
      queryRunner,
    });

    const existingPermissionIds = Array.from(
      new Set(existingPermissions.map((p) => p.id))
    );

    // Create the tier-permission relationships
    const tierPermissions = existingPermissionIds.map((permissionId) => ({
      subscriptionTierId: tierId,
      permissionId,
      subscriptionTier: { id: tierId } as SubscriptionTierEntity,
      permission: { id: permissionId } as PermissionEntity,
    }));

    await this._subscriptionTiersPermissionsService.createMany({
      dataArray: tierPermissions,
      options: { queryRunner },
    });
  }
}
