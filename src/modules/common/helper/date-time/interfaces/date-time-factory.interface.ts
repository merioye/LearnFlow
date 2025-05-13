import { IDateTime } from './date-time.interface';

export interface IDateTimeFactory {
  /**
   * Create a DateTime instance
   */
  createDateTime(): IDateTime;
}
