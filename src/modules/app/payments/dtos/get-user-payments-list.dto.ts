import { IsDate, IsEnum } from 'class-validator';

import { OffsetPaginationDto } from '@/common/pagination';
import { TrimString, ValidateIfPresent } from '@/core/decorators';

import { PaymentStatus } from '../enums';

export class GetUserPaymentsListDto extends OffsetPaginationDto {
  @ValidateIfPresent()
  @TrimString()
  @IsEnum(PaymentStatus, {
    message: `Invalid status, allowed values are ${Object.values(PaymentStatus)?.join(', ')}`,
  })
  status?: PaymentStatus;

  @ValidateIfPresent()
  @TrimString()
  @IsDate({ message: 'Start date must be a valid date' })
  startDate?: Date;

  @ValidateIfPresent()
  @TrimString()
  @IsDate({ message: 'End date must be a valid date' })
  endDate?: Date;
}
