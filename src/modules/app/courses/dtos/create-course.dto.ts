import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

import { TrimString, ValidateIfPresent } from '@/core/decorators';

import { Currency } from '../../payments';
import { CourseLevel, CourseStatus } from '../enums';

export class CreateCourseDto {
  @TrimString()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @TrimString()
  @IsString({ message: 'Category must be a string' })
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number' })
  @Min(0.01, { message: 'Price must be at least 0.01' })
  @IsNotEmpty({ message: 'Price is required' })
  price: number;

  @IsEnum(Currency, {
    message: `Invalid currency, Allowed values are ${Object.values(Currency).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Currency is required' })
  currency: Currency;

  @ValidateIfPresent()
  @IsEnum(CourseLevel, {
    message: `Invalid level, Allowed values are ${Object.values(CourseLevel).join(', ')}`,
  })
  level?: CourseLevel;

  @ValidateIfPresent()
  @IsEnum(CourseStatus, {
    message: `Invalid status, Allowed values are ${Object.values(CourseStatus).join(', ')}`,
  })
  status?: CourseStatus;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Thumbnail path must be a string' })
  thumbnailPath?: string;

  @ValidateIfPresent()
  @IsString({ each: true, message: 'All tags must be string' })
  tags?: string[];
}
