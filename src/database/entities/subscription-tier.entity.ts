import { Column, Entity, Index, OneToMany } from 'typeorm';

import { Currency } from '@/modules/app/payments';
import {
  SubscriptionTier,
  SupportLevel,
} from '@/modules/app/subscription-tiers';

import { PriceTransformer } from '../utils';
import { BaseEntity } from './base';
import { SubscriptionTierPermissionEntity } from './subscription-tier-permission.entity';

@Entity({ name: 'tbl_subscription_tiers' })
@Index(['isActive', 'price', 'sortOrder'])
export class SubscriptionTierEntity extends BaseEntity {
  @Column({ name: 'tier_code', type: 'text', unique: true })
  @Index()
  tierCode: SubscriptionTier;

  @Column({
    name: 'tier_name',
    comment: 'Display name for the subscription tier',
  })
  tierName: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
    comment: 'Marketing description of the tier',
  })
  description: string | null;

  @Column({
    name: 'sort_order',
    type: 'integer',
    default: 0,
    comment: 'Display order (0 = highest priority)',
  })
  sortOrder: number;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 4,
    comment: 'Price of the subscription',
    transformer: new PriceTransformer(),
  })
  price: number;

  @Column({
    type: 'char',
    default: Currency.USD,
    length: 3,
    comment: 'ISO Currency code',
  })
  currency: Currency;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'trial_days',
    default: 0,
    comment: 'Number of trial days (0 if no trial)',
  })
  trialDays: number;

  @Column({
    name: 'is_popular',
    type: 'boolean',
    default: false,
    comment: 'Show "Most Popular" badge',
  })
  isPopular: boolean;

  @Column({
    name: 'features_list',
    type: 'jsonb',
    comment: 'Marketing features to display ["Feature 1", "Feature 2"]',
  })
  featuresList: string[];

  @Column({
    name: 'max_students',
    type: 'integer',
    nullable: true,
    comment: 'Maximum students a teacher can have (null = unlimited)',
  })
  maxStudents: number | null;

  @Column({
    name: 'max_courses',
    type: 'integer',
    nullable: true,
    comment: 'Maximum courses a teacher can create (null = unlimited)',
  })
  maxCourses: number | null;

  @Column({
    name: 'max_storage_gb',
    type: 'integer',
    nullable: true,
    comment: 'Storage limit in GB (null = unlimited)',
  })
  maxStorageGb: number | null;

  @Column({
    name: 'max_video_upload_mb',
    type: 'integer',
    default: 100,
    comment: 'Max video file size in MB',
  })
  maxVideoUploadMb: number;

  @Column({
    name: 'max_assignments_per_course',
    type: 'integer',
    nullable: true,
    comment: 'Maximum assignments per course (null = unlimited)',
  })
  maxAssignmentsPerCourse: number | null;

  @Column({
    name: 'max_quizzes_per_course',
    type: 'integer',
    nullable: true,
    comment: 'Maximum quizzes per course (null = unlimited)',
  })
  maxQuizzesPerCourse: number | null;

  @Column({
    name: 'can_use_ai_features',
    type: 'boolean',
    default: false,
    comment: 'Access to AI-powered content generation',
  })
  canUseAiFeatures: boolean;

  @Column({
    name: 'support_level',
    type: 'text',
    default: SupportLevel.BASIC,
  })
  supportLevel: SupportLevel;

  @OneToMany(
    () => SubscriptionTierPermissionEntity,
    (stp) => stp.subscriptionTier
  )
  tierPermissions: SubscriptionTierPermissionEntity[];
}
