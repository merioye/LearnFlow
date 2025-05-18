import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IDateTime, InjectDateTime } from '@/modules/common/helper/date-time';
import { ILogger, InjectLogger } from '@/modules/common/logger';
import { DataSource } from 'typeorm';

import { TDatabaseHealth } from '../types';

/**
 * Service for checking the health of the database
 *
 * @class DatabaseHealthService
 */
@Injectable()
export class DatabaseHealthService {
  private _isConnected = false;

  public constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    @InjectLogger() private readonly _logger: ILogger,
    @InjectDateTime() private readonly _dateTime: IDateTime
  ) {}

  /**
   * Simple ping to check database connectivity
   * @returns Promise resolving to boolean
   */
  async ping(): Promise<boolean> {
    try {
      // Execute a simple query
      await this._dataSource.query('SELECT 1');
      this._isConnected = true;
      return true;
    } catch (error) {
      this._logger.error('Database ping failed:', {
        error,
      });
      this._isConnected = false;
      return false;
    }
  }

  /**
   * Comprehensive health check for the database
   * @returns Health status object with detailed information
   */
  public async checkHealth(): Promise<TDatabaseHealth> {
    try {
      const startTime = this._dateTime.timestamp;

      // Check if we can execute a basic query
      await this.ping();

      // Check if migrations are pending
      let hasPendingMigrations = false;
      try {
        hasPendingMigrations = await this._dataSource.showMigrations();
      } catch (error) {
        this._logger.warn('Could not check pending migrations', {
          error,
        });
      }

      const responseTime = this._dateTime.timestamp - startTime;

      return {
        status: 'up',
        responseTime,
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
        pendingMigrations: hasPendingMigrations,
        details: {
          isConnected: this._isConnected,
          isInitialized: this._dataSource.isInitialized,
        },
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: 0,
        timestamp: this._dateTime.toUTC(this._dateTime.now()),
        error: (error as Error)?.message,
        details: {
          isConnected: false,
          isInitialized: this._dataSource
            ? this._dataSource.isInitialized
            : false,
        },
      };
    }
  }
}
