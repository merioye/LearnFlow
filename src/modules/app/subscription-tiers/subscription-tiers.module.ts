import { Module } from '@nestjs/common';

import { PermissionsModule } from '../permissions';
import { SubscriptionTiersService } from './services';
import { SubscriptionTiersController } from './subscription-tiers.controller';

@Module({
  imports: [PermissionsModule],
  controllers: [SubscriptionTiersController],
  providers: [SubscriptionTiersService],
  exports: [SubscriptionTiersService],
})
export class SubscriptionTiersModule {}
