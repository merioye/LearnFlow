import { OffsetPaginationDto } from '@/common/pagination';
import { TrimString, ValidateIfPresent } from '@/core/decorators';
import { IsEnum, IsInt, IsPositive, IsString } from 'class-validator';

import { CourseLevel, CourseStatus } from '../enums';

export class GetCourseListDto extends OffsetPaginationDto {
  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @ValidateIfPresent()
  @IsEnum(CourseLevel, {
    message: `Invalid level, allowed values are ${Object.values(
      CourseLevel
    ).join(', ')}`,
  })
  level?: CourseLevel;

  @ValidateIfPresent()
  @IsEnum(CourseStatus, {
    message: `Invalid status, allowed values are ${Object.values(
      CourseStatus
    ).join(', ')}`,
  })
  status?: CourseStatus;

  @ValidateIfPresent()
  @IsPositive({ message: 'Teacher ID must be a positive integer' })
  @IsInt({ message: 'Teacher ID must be an integer' })
  teacherId?: number;
}
