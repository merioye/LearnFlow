import { CryptoHashService, HashAlgorithm } from '@/modules/common/hash';
import { DayjsDateTimeAdapter } from '@/modules/common/helper/date-time';

import { logger } from '@/config';
import { Config, Role } from '@/enums';
import { ADMIN_USER, SYSTEM_USER } from '@/constants';

import { AppDataSource } from '../config';
import { UserEntity } from '../entities';

export const seedUsers = async (): Promise<void> => {
  const context = {
    name: 'UserSeed',
    method: 'seedUsers',
  };

  logger.info('🔍 Seeding users started...', { context });
  const hashService = new CryptoHashService();
  const dateTime = new DayjsDateTimeAdapter();

  try {
    const adminUserEmail = process.env[Config.ADMIN_USER_EMAIL];
    const adminUserPassword = process.env[Config.ADMIN_USER_PASSWORD];
    const systemUserEmail = process.env[Config.SYSTEM_USER_EMAIL];
    const systemUserPassword = process.env[Config.SYSTEM_USER_PASSWORD];
    if (
      !adminUserEmail ||
      !adminUserPassword ||
      !systemUserEmail ||
      !systemUserPassword
    ) {
      throw new Error('❌ User email or password is missing in users seed');
    }

    // Seed application default users
    const userRepository = AppDataSource.getRepository(UserEntity);
    await userRepository.upsert(
      {
        firstName: SYSTEM_USER.firstName,
        lastName: SYSTEM_USER.lastName,
        email: systemUserEmail,
        role: Role.SYSTEM,
        password: await hashService.hash(systemUserPassword, {
          algorithm: HashAlgorithm.SHA256,
        }),
        createdAt: dateTime.toUTC(dateTime.now()),
        updatedAt: dateTime.toUTC(dateTime.now()),
      },
      {
        conflictPaths: ['email'], // Column(s) used to determine conflict
        skipUpdateIfNoValuesChanged: true, // Optional optimization
      }
    );
    await userRepository.upsert(
      {
        firstName: ADMIN_USER.firstName,
        lastName: ADMIN_USER.lastName,
        email: adminUserEmail,
        role: Role.ADMIN,
        password: await hashService.hash(adminUserPassword, {
          algorithm: HashAlgorithm.SHA256,
        }),
        createdAt: dateTime.toUTC(dateTime.now()),
        updatedAt: dateTime.toUTC(dateTime.now()),
      },
      {
        conflictPaths: ['email'], // Column(s) used to determine conflict
        skipUpdateIfNoValuesChanged: true, // Optional optimization
      }
    );

    logger.info('✅ User seed completed', { context });
  } catch (error) {
    logger.error('❌ Seeding users failed: ', { context, error });
  }
};
