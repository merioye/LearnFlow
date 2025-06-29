import { TrimString, ValidateIfPresent } from '@/core/decorators';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

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

  @IsInt({ message: 'Price must be an integer' })
  @Min(0, { message: 'Price must be minimum 0' })
  @IsNotEmpty({ message: 'Price is required' })
  priceUsdCents: number;

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
