import { TrimString, ValidateIfPresent } from '@/core/decorators';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { StorageEntity } from '../enums';

export class GenerateUploadUrlDto {
  @TrimString()
  @IsString({ message: 'File type must be a string' })
  @IsNotEmpty({ message: 'File type is required' })
  fileType!: string;

  @TrimString()
  @IsString({ message: 'File name must be a string' })
  @IsNotEmpty({ message: 'File name is required' })
  fileName!: string;

  @TrimString()
  @IsEnum(StorageEntity, {
    message: 'Entity type is invalid',
  })
  @IsString({ message: 'Entity type must be a string' })
  @IsNotEmpty({ message: 'Entity type is required' })
  entityType!: StorageEntity;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Entity ID must be a string' })
  entityId?: string;
}
