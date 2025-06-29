import { CourseLevel, CourseStatus } from '@/modules/app/courses';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base';
import { UserEntity } from './user.entity';

@Entity('tbl_courses')
export class CourseEntity extends BaseEntity {
  @Column({ name: 'teacher_id' })
  @Index()
  teacherId: number;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: UserEntity;

  @Column()
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column()
  category: string;

  @Column({
    name: 'price_usd_cents',
    type: 'integer',
    default: 0,
    comment: 'Price in USD cents',
  })
  priceUsdCents: number;

  @Column({
    type: 'text',
    default: CourseLevel.BEGINNER,
  })
  level: CourseLevel;

  @Column({
    type: 'text',
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Column({ name: 'thumbnail_path', type: 'text', nullable: true })
  thumbnailPath: string | null;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @Column({ name: 'total_enrollments', type: 'integer', default: 0 })
  totalEnrollments: number;
}
