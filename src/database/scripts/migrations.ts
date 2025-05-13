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
  logger.info(`Migration created: ${filePath}`, {
    name: 'Migrations',
    method: 'createMigrationFile',
  });
};

// Generate a migration based on schema changes
const generateMigration = async (name: string): Promise<void> => {
  const context = {
    name: 'Migrations',
    method: 'generateMigration',
  };

  try {
    const command = `typeorm-ts-node-commonjs migration:generate src/database/migrations/${name} -d src/database/config/data-source.ts`;
    logger.info(`Executing: ${command}`, { context });
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    logger.error('Failed to generate migration:', { context, error });
    process.exit(1);
  }
};

// Run pending migrations
const runMigrations = async (): Promise<void> => {
  const context = {
    name: 'Migrations',
    method: 'runMigrations',
  };
  let dataSource: DataSource | undefined;

  try {
    dataSource = await initDataSource();
    const migrations = await dataSource.runMigrations();

    if (migrations.length === 0) {
      logger.info('No pending migrations to execute', { context });
    } else {
      logger.info(`Executed ${migrations.length} migrations:`, { context });
      migrations.forEach((migration) => {
        logger.info(`- ${migration.name}`, { context });
      });
    }
  } catch (error) {
    logger.error('Error running migrations:', { context, error });
    process.exit(1);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

// Revert the last executed migration
const revertMigration = async (): Promise<void> => {
  const context = {
    name: 'Migrations',
    method: 'revertMigration',
  };
  let dataSource: DataSource | undefined;

  try {
    dataSource = await initDataSource();
    await dataSource.undoLastMigration();
    logger.info('Last migration has been reverted successfully', { context });
  } catch (error) {
    logger.error('Error reverting migration:', { context, error });
    process.exit(1);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

// Revert all migrations
const revertAllMigrations = async (): Promise<void> => {
  const context = {
    name: 'Migrations',
    method: 'revertAllMigrations',
  };
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
      logger.info(`Reverted migration: ${migrations[0].name}`, { context });
      migrationCount++;
    }

    if (migrationCount === 0) {
      logger.info('No migrations to revert', { context });
    } else {
      logger.info(`All ${migrationCount} migrations have been reverted`, {
        context,
      });
    }
  } catch (error) {
    logger.error('Error reverting all migrations:', { context, error });
    process.exit(1);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

// Main function to handle different commands
const main = async (): Promise<void> => {
  const context = {
    name: 'Migrations',
    method: 'main',
  };
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'generate':
      if (args.length < 2) {
        logger.error('Please provide a name for the migration', { context });
        process.exit(1);
      }
      await generateMigration(args[1] || '');
      break;

    case 'create':
      if (args.length < 2) {
        logger.error('Please provide a name for the migration', { context });
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
      logger.error(`Unknown command: ${command}`, { context });
      logger.info(
        'Available commands: generate, create, run, revert, revertAll',
        { context }
      );
      process.exit(1);
  }
};

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    const context = {
      name: 'Migrations',
      method: 'main',
    };
    logger.error('Error:', { context, error });
    process.exit(1);
  });
