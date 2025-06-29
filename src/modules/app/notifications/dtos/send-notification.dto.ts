import { ValidateIfPresent } from '@/core/decorators';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';

import { NotificationMedium } from '../enums';
import { NotificationContentDto } from './notification-content.dto';
import { NotificationOptionsDto } from './notification-options.dto';
import { NotificationRecipientDto } from './notification-recipient.dto';

export class SendNotificationDto {
  @ValidateNested({ each: true })
  @Type(() => NotificationRecipientDto)
  @IsArray({ message: 'Recipients must be an array' })
  recipients: NotificationRecipientDto[];

  @ValidateNested()
  @Type(() => NotificationContentDto)
  content: NotificationContentDto;

  @ValidateIfPresent()
  @IsEnum(NotificationMedium, {
    message: `Invalid medium, allowed values: ${Object.values(NotificationMedium).join(', ')}`,
  })
  @IsString({ message: 'Medium must be a string' })
  medium?: NotificationMedium;

  @ValidateIfPresent()
  @ValidateNested()
  @Type(() => NotificationOptionsDto)
  options?: NotificationOptionsDto;
}
