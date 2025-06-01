import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base';

@Entity('tbl_distributed_locks')
export class DistributedLockEntity extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;
}
