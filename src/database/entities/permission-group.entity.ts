import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from './base';
import { PermissionEntity } from './permission.entity';
import { UserEntity } from './user.entity';

@Entity('tbl_permission_groups')
export class PermissionGroupEntity extends BaseEntity {
  @Column()
  @Index({ unique: true })
  name: string;

  @Column()
  @Index({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ name: 'sort_order' })
  sortOrder: number;

  @OneToMany(() => PermissionEntity, (permission) => permission.permissionGroup)
  permissions: PermissionEntity[];

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  createdBy: UserEntity | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  updatedBy: UserEntity | null;
}
