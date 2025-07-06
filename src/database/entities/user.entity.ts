import { Column, Entity, Index, OneToMany } from 'typeorm';

import { UserStatus } from '@/modules/app/users';

import { Role } from '@/enums';

import { BaseEntity } from './base';
import { PaymentEntity } from './payment.entity';

@Entity('tbl_users')
export class UserEntity extends BaseEntity {
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

  @OneToMany(() => PaymentEntity, (payment) => payment.user)
  payments: PaymentEntity[];
}
