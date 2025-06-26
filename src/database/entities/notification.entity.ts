import {
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '@/modules/app/notifications';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base';
import { UserEntity } from './user.entity';

@Entity('tbl_notifications')
@Index(['userId', 'status']) // For filtering user notifications by status
@Index(['userId', 'createdAt']) // For chronological queries
@Index(['type', 'userId']) // For filtering by notification type
export class NotificationEntity extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: NotificationStatus.UNREAD, type: 'text' })
  status: NotificationStatus;

  @Column({ type: 'text' })
  type: NotificationType;

  @Column({ default: NotificationPriority.LOW, type: 'text' })
  priority: NotificationPriority; // For notification ordering

  @Column({ name: 'read_at', nullable: true, type: 'timestamp' })
  readAt: Date | null;

  @Column({ name: 'expires_at', nullable: true, type: 'timestamp' })
  expiresAt: Date | null; // For time-sensitive notifications

  @Column({ name: 'action_url', nullable: true, type: 'text' })
  actionUrl: string | null; // Deep link or URL for notification action

  @Column({ name: 'image_path', nullable: true, type: 'text' })
  imagePath: string | null; // For rich notifications with images

  @Column({ name: 'related_id', nullable: true, type: 'int' })
  relatedId: number | null; // Related entity ID (course, payment)

  @Column({ name: 'user_id' })
  userId: number; // Recipient user ID

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
