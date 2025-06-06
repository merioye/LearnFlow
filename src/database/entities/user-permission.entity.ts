import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from './base';
import { PermissionEntity } from './permission.entity';
import { UserEntity } from './user.entity';

@Entity('tbl_user_permissions')
@Unique(['userId', 'permissionId'])
export class UserPermissionEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'permission_id' })
  permissionId: number;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => PermissionEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  createdBy: UserEntity | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  updatedBy: UserEntity | null;
}
