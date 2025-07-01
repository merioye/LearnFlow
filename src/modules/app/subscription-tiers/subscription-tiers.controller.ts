import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiResponse } from '@/common/utils';
import { CustomParseIntPipe } from '@/core/pipes';
import { ILogger, InjectLogger } from '@/modules/common/logger';

import { SubscriptionTierEntity } from '@/database';

import { Role } from '@/enums';
import { ENDPOINTS } from '@/constants';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateSubscriptionTierDto, UpdateSubscriptionTierDto } from './dtos';
import { SubscriptionTiersService } from './services';

@Controller(ENDPOINTS.SubscriptionTier.Base)
export class SubscriptionTiersController {
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _subscriptionTiersService: SubscriptionTiersService
  ) {}

  /**
   * Create a new subscription tier
   * @param input - Subscription tier data
   * @param currentUserId - Currently logged in user id
   * @returns Created subscription tier
   */
  @Post(ENDPOINTS.SubscriptionTier.Post.CreateSubscriptionTier)
  @Roles(Role.ADMIN)
  public async create(
    @Body() input: CreateSubscriptionTierDto,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<SubscriptionTierEntity>> {
    this._logger.debug('Create subscription tier request', {
      data: {
        ...input,
        permissions: input.permissions?.length || 0,
        by: currentUserId,
      },
    });

    const createdTier = await this._subscriptionTiersService.createOne(input);

    this._logger.info('Subscription tier created successfully', {
      data: { id: createdTier.id, tierCode: createdTier.tierCode },
    });

    return new ApiResponse({
      message: 'Subscription tier created successfully',
      result: createdTier,
      statusCode: HttpStatus.CREATED,
    });
  }

  /**
   * Get all subscription tiers
   * @returns Subscription tiers list
   */
  @Public()
  @Get(ENDPOINTS.SubscriptionTier.Get.SubscriptionTierList)
  public async getAll(): Promise<ApiResponse<SubscriptionTierEntity[]>> {
    this._logger.debug('Get subscription tiers request');

    const tiers = await this._subscriptionTiersService.findAll();

    return new ApiResponse({
      message: 'Data fetched successfully',
      result: tiers,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Update a subscription tier
   * @param id - Subscription tier ID
   * @param input - Subscription tier data
   * @param currentUserId - Currently logged in user id
   * @returns Updated subscription tier
   */
  @Patch(ENDPOINTS.SubscriptionTier.Put.UpdateSubscriptionTier)
  @Roles(Role.ADMIN)
  public async update(
    @Param('id', CustomParseIntPipe) id: number,
    @Body() input: UpdateSubscriptionTierDto,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<SubscriptionTierEntity>> {
    this._logger.debug('Update subscription tier request', {
      data: {
        id,
        ...input,
        permissions: input.permissions?.length || 0,
        by: currentUserId,
      },
    });

    const updatedTier = await this._subscriptionTiersService.updateOne(
      id,
      input
    );

    this._logger.info('Subscription tier updated successfully', {
      data: { id, tierCode: updatedTier.tierCode },
    });

    return new ApiResponse({
      message: 'Subscription tier updated successfully',
      result: updatedTier,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Delete a subscription tier
   * @param id - Subscription tier ID
   * @param currentUserId - Currently logged in user id
   * @returns {Promise<null>}
   */
  @Delete(ENDPOINTS.SubscriptionTier.Delete.DeleteSubscriptionTier)
  @Roles(Role.ADMIN)
  public async delete(
    @Param('id', CustomParseIntPipe) id: number,
    @CurrentUser('userId') currentUserId: number
  ): Promise<ApiResponse<null>> {
    this._logger.debug('Delete subscription tier request', {
      data: { id, by: currentUserId },
    });

    const deletedSubscriptionTier =
      await this._subscriptionTiersService.deleteOne(id);

    this._logger.info('Subscription tier deleted successfully', {
      data: { id, tierCode: deletedSubscriptionTier.tierCode },
    });

    return new ApiResponse({
      message: 'Subscription tier deleted successfully',
      result: null,
      statusCode: HttpStatus.OK,
    });
  }
}
