import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { BaseEntity } from './base';
import { PermissionGroupEntity } from './permission-group.entity';
import { UserEntity } from './user.entity';

@Entity('tbl_permissions')
export class PermissionEntity extends BaseEntity {
  @Column()
  @Index({ unique: true })
  name: string;

  @Column()
  @Index({ unique: true })
  slug: string;

  @Column({ name: 'sort_order' })
  sortOrder: number;

  @ManyToOne(
    () => PermissionGroupEntity,
    (permissionGroup) => permissionGroup.permissions,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' }
  )
  permissionGroup: PermissionGroupEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  createdBy: UserEntity | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  updatedBy: UserEntity | null;
}
