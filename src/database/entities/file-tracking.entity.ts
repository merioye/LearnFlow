import { FileStatus } from '@/modules/app/storage/enums';
import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from './base';

@Entity('tbl_file_tracking')
export class FileTrackingEntity extends BaseEntity {
  @Column({ name: 'file_path' })
  @Index({ unique: true })
  filePath: string;

  @Column({ name: 'owner_id' })
  @Index()
  ownerId: number;

  @Column({ name: 'reference_count', default: 0 })
  referenceCount: number;

  @Column({ type: 'text', default: FileStatus.PENDING })
  status: FileStatus;

  @Column({ name: 'last_referenced_at', nullable: true, type: 'timestamp' })
  lastReferencedAt: Date | null;
}
