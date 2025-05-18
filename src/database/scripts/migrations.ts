import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';

import { logger } from '@/config';

import { AppDataSource } from '../config';

// The path to the migration files
const MIGRATION_DIR = path.join(__dirname, '../migrations');

// Ensure the migrations directory exists
if (!fs.existsSync(MIGRATION_DIR)) {
  fs.mkdirSync(MIGRATION_DIR, { recursive: true });
}

// Initialize the DataSource
const initDataSource = async (): Promise<DataSource> => {
  await AppDataSource.initialize();
  return AppDataSource;
};

// Create a new empty migration file
const createMigrationFile = (name: string): void => {
  const timestamp = new Date().getTime();
  const fileName = `${timestamp}-${name}.ts`;
  const filePath = path.join(MIGRATION_DIR, fileName);

  const template = `import { MigrationInterface, QueryRunner } from "typeorm";

  export class ${name.replace(/-/g, '')}${timestamp} implements MigrationInterface {
      name = '${name}${timestamp}'

      public async up(queryRunner: QueryRunner): Promise<void> {
          // Add your migration logic here
      }

      public async down(queryRunner: QueryRunner): Promise<void> {
          // Add your rollback logic here
      }
  }
  `;

  fs.writeFileSync(filePath, template);
  logger.info(`Migration created: ${filePath}`);
};

// Generate a migration based on schema changes
const generateMigration = async (name: string): Promise<void> => {
  try {
    const command = `typeorm-ts-node-commonjs migration:generate src/database/migrations/${name} -d src/database/config/data-source.ts`;
    logger.info(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    logger.error('Failed to generate migration:', { error });
    process.exit(1);
  }
};

// Run pending migrations
const runMigrations = async (): Promise<void> => {
  let dataSource: DataSource | undefined;

  try {
    dataSource = await initDataSource();
    const migrations = await dataSource.runMigrations();

    if (migrations.length === 0) {
      logger.info('No pending migrations to execute');
    } else {
      logger.info(`Executed ${migrations.length} migrations:`);
      migrations.forEach((migration) => {
        logger.info(`- ${migration.name}`);
      });
    }
  } catch (error) {
    logger.error('Error running migrations:', { error });
    process.exit(1);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

// Revert the last executed migration
const revertMigration = async (): Promise<void> => {
  let dataSource: DataSource | undefined;

  try {
    dataSource = await initDataSource();
    await dataSource.undoLastMigration();
    logger.info('Last migration has been reverted successfully');
  } catch (error) {
    logger.error('Error reverting migration:', { error });
    process.exit(1);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

// Revert all migrations
const revertAllMigrations = async (): Promise<void> => {
  let dataSource: DataSource | undefined;

  try {
    dataSource = await initDataSource();

    // Keep reverting until no migrations left
    let migrationCount = 0;

    // Get the name of the migrations table
    const migrationsTableName =
      dataSource.options.migrationsTableName || 'migrations';

    while (true) {
      const migrations = await dataSource
        .query(`SELECT * FROM ${migrationsTableName} ORDER BY id DESC LIMIT 1`)
        .catch(() => []);

      if (!migrations || migrations.length === 0) {
        break;
      }

      await dataSource.undoLastMigration();
      logger.info(`Reverted migration: ${migrations[0].name}`);
      migrationCount++;
    }

    if (migrationCount === 0) {
      logger.info('No migrations to revert');
    } else {
      logger.info(`All ${migrationCount} migrations have been reverted`);
    }
  } catch (error) {
    logger.error('Error reverting all migrations:', { error });
    process.exit(1);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

// Main function to handle different commands
const main = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'generate':
      if (args.length < 2) {
        logger.error('Please provide a name for the migration');
        process.exit(1);
      }
      await generateMigration(args[1] || '');
      break;

    case 'create':
      if (args.length < 2) {
        logger.error('Please provide a name for the migration');
        process.exit(1);
      }
      createMigrationFile(args[1] || '');
      break;

    case 'run':
      await runMigrations();
      break;

    case 'revert':
      await revertMigration();
      break;

    case 'revertAll':
      await revertAllMigrations();
      break;

    default:
      logger.error(`Unknown command: ${command}`);
      logger.info(
        'Available commands: generate, create, run, revert, revertAll'
      );
      process.exit(1);
  }
};

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error('Error:', { error });
    process.exit(1);
  });
