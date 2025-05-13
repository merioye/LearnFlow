import { AppDataSource } from '../config';

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...');

  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('✅ Successfully connected to the database');

    // Run a simple query to verify full functionality
    const currentTimeResult = await AppDataSource.query('SELECT NOW()');
    console.log('📊 Database query test successful');
    console.log(`Current database timestamp: ${currentTimeResult[0]?.now}`);

    // Get database version
    const versionResult = await AppDataSource.query('SELECT version()');
    console.log(`Database version: ${versionResult[0]?.version}`);
  } catch (error) {
    console.error('❌ Database connection failed');
    console.error('Error details: ', error);
    process.exit(1);
  } finally {
    // Destroy the data source if it was initialized
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Execute the check
checkDatabaseConnection().catch((error) => {
  console.error('❌ Unexpected error: ', error);
  process.exit(1);
});
