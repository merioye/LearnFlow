import { UserEntity } from '@/database';

export type TUserWithoutPassword = Omit<UserEntity, 'password'>;
