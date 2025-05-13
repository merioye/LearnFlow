import { logger } from '@/config';

import { AppDataSource } from '../config';
import { seedPermissions } from './permission.seed';
import { seedUsers } from './user.seed';

const seedInit = async (): Promise<void> => {
  const context = {
    name: 'Seeders',
    method: 'seedInit',
  };

  logger.info('🔍 Checking database connection...', { context });
  try {
    // Initialize the data source
    await AppDataSource.initialize();
    logger.info('✅ Successfully connected to the database', { context });

    // Seed users
    await seedUsers();
    // Seed permissions
    await seedPermissions();
  } catch (error) {
    logger.error('❌ Database connection failed', { context });
    logger.error('Error details: ', { context, error });
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
  const context = {
    name: 'Seeders',
    method: 'seedInit',
  };
  logger.error('❌ Unexpected error: ', { context, error });
  process.exit(1);
});
