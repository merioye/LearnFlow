import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { CourseLevel, CourseStatus } from '@/modules/app/courses';
import { Currency } from '@/modules/app/payments';

import { PriceTransformer } from '../utils';
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
    type: 'char',
    length: 3,
    comment: 'Currency code(ISO) of the course price',
  })
  currency: Currency;

  @Column({
    type: 'decimal',
    precision: 19,
    scale: 4,
    transformer: new PriceTransformer(),
  })
  price: number;

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
