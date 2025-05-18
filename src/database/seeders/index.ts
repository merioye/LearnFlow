import { logger } from '@/config';

import { AppDataSource } from '../config';
import { seedPermissions } from './permission.seed';
import { seedUsers } from './user.seed';

const seedInit = async (): Promise<void> => {
  logger.info('🔍 Checking database connection...');
  try {
    // Initialize the data source
    await AppDataSource.initialize();
    logger.info('✅ Successfully connected to the database');

    // Seed users
    await seedUsers();
    // Seed permissions
    await seedPermissions();
  } catch (error) {
    logger.error('❌ Database connection failed');
    logger.error('Error details: ', { error });
    process.exit(1);
  } finally {
    // Destroy the data source if it was initialized
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

// Execute the seed
seedInit().catch((error: unknown) => {
  logger.error('❌ Unexpected error: ', { error });
  process.exit(1);
});
