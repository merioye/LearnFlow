import { TrimString, ValidateIfPresent } from '@/core/decorators';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { SubscriptionTier, SupportLevel } from '../enums';

export class SubscriptionTierPermissionDto {
  @IsInt({ message: 'Permission ID must be an integer' })
  @IsPositive({ message: 'Permission ID must be a positive integer' })
  permissionId: number;
}

export class CreateSubscriptionTierDto {
  @IsEnum(SubscriptionTier, {
    message: `Invalid tier code, allowed values are ${Object.values(SubscriptionTier).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Tier code is required' })
  tierCode: SubscriptionTier;

  @TrimString()
  @IsString({ message: 'Tier name must be a string' })
  @IsNotEmpty({ message: 'Tier name is required' })
  tierName: string;

  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'Description must be a string' })
  description: string | null;

  @Min(0, { message: 'Sort order must be minimum 0' })
  @IsInt({ message: 'Sort order must be an integer' })
  @IsNotEmpty({ message: 'Sort order is required' })
  sortOrder: number;

  @Min(1, { message: 'Price must be minimum 1' })
  @IsInt({ message: 'Price must be an integer' })
  @IsNotEmpty({ message: 'Price is required' })
  priceUsdCents: number;

  @ValidateIfPresent()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  isActive: boolean;

  @Min(0, { message: 'Trial days must be minimum 0' })
  @IsInt({ message: 'Trial days must be an integer' })
  @IsNotEmpty({ message: 'Trial days is required' })
  trialDays: number;

  @IsBoolean({ message: 'IsPopular must be a boolean' })
  @IsNotEmpty({ message: 'IsPopular is required' })
  isPopular: boolean;

  @IsArray({ message: 'Features list must be an array' })
  @IsString({ each: true, message: 'Each feature list item must be a string' })
  featuresList: string[];

  @ValidateIfPresent()
  @IsInt({ message: 'Max students must be an integer' })
  @Min(1, { message: 'Max students must be minimum 1' })
  maxStudents: number | null;

  @ValidateIfPresent()
  @IsInt({ message: 'Max courses must be an integer' })
  @Min(1, { message: 'Max courses must be minimum 1' })
  maxCourses: number | null;

  @ValidateIfPresent()
  @IsInt({ message: 'Max storage GB must be an integer' })
  @Min(1, { message: 'Max storage GB must be minimum 1' })
  maxStorageGb: number | null;

  @ValidateIfPresent()
  @IsInt({ message: 'Max video upload MB must be an integer' })
  @Min(1, { message: 'Max video upload MB must be minimum 1' })
  maxVideoUploadMb: number;

  @ValidateIfPresent()
  @IsInt({ message: 'Max assignments per course must be an integer' })
  @Min(1, { message: 'Max assignments per course must be minimum 1' })
  maxAssignmentsPerCourse: number | null;

  @ValidateIfPresent()
  @IsInt({ message: 'Max quizzes per course must be an integer' })
  @Min(1, { message: 'Max quizzes per course must be minimum 1' })
  maxQuizzesPerCourse: number | null;

  @ValidateIfPresent()
  @IsBoolean({ message: 'Can use AI features must be a boolean' })
  @IsNotEmpty({ message: 'Can use AI features is required' })
  canUseAiFeatures: boolean;

  @IsEnum(SupportLevel, {
    message: `Invalid support level, allowed values are ${Object.values(SupportLevel).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Support level is required' })
  supportLevel: SupportLevel;

  @ValidateIfPresent()
  @IsArray({ message: 'Permissions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => SubscriptionTierPermissionDto)
  permissions?: SubscriptionTierPermissionDto[];
}
