import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base';
import { UserEntity } from './user.entity';

@Entity('tbl_refresh_tokens')
export class RefreshTokenEntity extends BaseEntity {
  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'user_id' })
  @Index({ unique: true })
  userId: number;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;
}
