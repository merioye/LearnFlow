import { DayjsDateTimeAdapter } from '@/modules/common/helper/date-time';

import { logger } from '@/config';
import { Action, Config, Resource, Role } from '@/enums';

import { AppDataSource } from '../config';
import {
  PermissionEntity,
  PermissionGroupEntity,
  UserEntity,
} from '../entities';

const data = Object.values(Resource).map((resource: string) => ({
  groupName: resource,
  groupSlug: resource.toLowerCase().split(' ').join('-'),
  description: `Permissions for ${resource}`,
  permissions: Object.values(Action).map((action: string) => ({
    name: `${action} ${resource}`,
    slug: `${action.toLowerCase()}-${resource.toLowerCase().split(' ').join('-')}`,
  })),
}));
export const seedPermissions = async (): Promise<void> => {
  const context = {
    name: 'PermissionSeed',
    method: 'seedPermissions',
  };

  logger.info('🔍 Seeding permissions started...', { context });
  const dateTime = new DayjsDateTimeAdapter();

  try {
    let groupSortOrder = 0;
    let permissionSortOrder = 0;

    const userRepository = AppDataSource.getRepository(UserEntity);
    const systemUser = await userRepository.findOne({
      where: {
        email: process.env[Config.SYSTEM_USER_EMAIL]!,
        role: Role.SYSTEM,
      },
    });
    const systemUserId = systemUser?.id ?? null;

    // Process each data entry
    for (const seed of data) {
      // Create a transaction
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Get transactional repositories
        const permissionGroupRepository = queryRunner.manager.getRepository(
          PermissionGroupEntity
        );
        const permissionRepository =
          queryRunner.manager.getRepository(PermissionEntity);

        // Upsert permission group
        await permissionGroupRepository.upsert(
          {
            name: seed.groupName,
            slug: seed.groupSlug,
            description: seed.description,
            sortOrder: groupSortOrder,
            createdAt: dateTime.toUTC(dateTime.now()),
            updatedAt: dateTime.toUTC(dateTime.now()),
            createdBy: { id: systemUserId ?? undefined },
            updatedBy: { id: systemUserId ?? undefined },
          },
          {
            conflictPaths: ['slug'],
            skipUpdateIfNoValuesChanged: true,
          }
        );

        // Get the inserted/updated permission group
        const insertedPermissionGroup = await permissionGroupRepository.findOne(
          {
            where: { slug: seed.groupSlug },
          }
        );
        if (!insertedPermissionGroup) {
          throw new Error(
            `Failed to find permission group with slug: ${seed.groupSlug}`
          );
        }

        // Process permissions for this group
        for (const permission of seed.permissions) {
          await permissionRepository.upsert(
            {
              name: permission.name,
              slug: permission.slug,
              permissionGroup: { id: insertedPermissionGroup.id },
              sortOrder: permissionSortOrder,
              createdAt: dateTime.toUTC(dateTime.now()),
              updatedAt: dateTime.toUTC(dateTime.now()),
              createdBy: { id: systemUserId ?? undefined },
              updatedBy: { id: systemUserId ?? undefined },
            },
            {
              conflictPaths: ['slug'],
              skipUpdateIfNoValuesChanged: true,
            }
          );
          permissionSortOrder++;
        }

        // Commit transaction
        await queryRunner.commitTransaction();

        permissionSortOrder = 0;
        groupSortOrder++;
      } catch (error) {
        // Rollback transaction on error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release query runner
        await queryRunner.release();
      }
    }
    logger.info('✅ Permission seed completed', { context });
  } catch (error) {
    logger.error('❌ Seeding permissions failed: ', { context, error });
  }
};
