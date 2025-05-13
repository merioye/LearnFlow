import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { Role } from '@/enums';

import { UserStatus } from '../enums';

@Entity('tbl_users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column()
  @Index({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'profile_url', nullable: true, type: 'text' })
  profileUrl: string | null;

  @Column({ default: Role.STUDENT, type: 'text' })
  role: Role;

  @Column({ default: UserStatus.ACTIVE, type: 'text' })
  status: UserStatus;

  @Column({ name: 'last_login_at', nullable: true, type: 'timestamp' })
  lastLoginAt: Date | null;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;
}
