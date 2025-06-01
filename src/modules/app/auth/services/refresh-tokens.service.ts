import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { DataSource } from 'typeorm';

import { BaseTypeOrmService, RefreshTokenEntity, UserEntity } from '@/database';

import { Config } from '@/enums';

/**
 * Refresh token service for handling refresh token related operations
 * @class RefreshTokensService
 * @extends {BaseTypeOrmService}
 */
@Injectable()
export class RefreshTokensService extends BaseTypeOrmService<RefreshTokenEntity> {
  public constructor(
    @InjectDateTime() dateTime: IDateTime,
    @InjectDataSource() dataSource: DataSource,
    private readonly _configService: ConfigService
  ) {
    super(dateTime, dataSource, RefreshTokenEntity, {
      softDelete: false,
    });
  }

  /**
   * Saves a new refresh token in the database for the specified user
   * @param {number} userId - The ID of the user
   * @returns {Promise<RefreshTokenEntity>} The created refresh token
   */
  public async persist(userId: number): Promise<RefreshTokenEntity> {
    const expiresAt = this.dateTime.toUTC(
      this.dateTime.timestamp +
        this._configService.get<number>(Config.JWT_REFRESH_EXPIRATION_TIME)!
    );

    return this.create({
      data: {
        expiresAt,
        userId,
        user: {
          id: userId,
        } as UserEntity,
        isRevoked: false,
      },
    });
  }
}
