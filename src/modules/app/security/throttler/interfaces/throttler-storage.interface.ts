import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';

export interface IThrottlerStorage {
  /**
   * Increment request count for a specific key
   * @param key - Unique identifier for the client/route
   * @returns Promise with the current throttle record
   */
  increment(key: string): Promise<ThrottlerStorageRecord>;

  /**
   * Retrieve the current record for a specific key
   * @param key - Unique identifier for the client/route
   * @returns Promise with the current throttle record
   */
  getRecord(key: string): Promise<ThrottlerStorageRecord>;

  /**
   * Reset the counter for a specific key
   * @param key - Unique identifier for the client/route
   */
  reset(key: string): Promise<void>;
}
