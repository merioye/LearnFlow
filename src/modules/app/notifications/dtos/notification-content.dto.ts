import { TrimString, ValidateIfPresent } from '@/core/decorators';
import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class NotificationContentDto {
  @TrimString()
  @IsString({ message: 'Subject must a string' })
  @IsNotEmpty({ message: 'Subject is required' })
  subject: string;

  @TrimString()
  @IsString({ message: 'Body must be a string' })
  @IsNotEmpty({ message: 'Body is required' })
  body: string;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Html must be a string' })
  html?: string;

  @ValidateIfPresent()
  @IsObject({ message: 'Data must be an object' })
  data?: Record<string, any>;

  @ValidateIfPresent()
  @IsArray({ message: 'Attachments must be an array' })
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}
