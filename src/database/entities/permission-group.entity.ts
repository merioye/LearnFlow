import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PermissionEntity } from './permission.entity';
import { UserEntity } from './user.entity';

@Entity('tbl_permission_groups')
export class PermissionGroupEntity {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  createdBy: UserEntity | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  updatedBy: UserEntity | null;
}
