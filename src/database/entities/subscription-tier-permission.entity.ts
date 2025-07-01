import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from './base';
import { PermissionEntity } from './permission.entity';
import { SubscriptionTierEntity } from './subscription-tier.entity';

@Entity('tbl_subscription_tiers_permissions')
@Unique(['subscriptionTierId', 'permissionId'])
export class SubscriptionTierPermissionEntity extends BaseEntity {
  @Column({ name: 'subscription_tier_id' })
  subscriptionTierId: number;

  @Column({ name: 'permission_id' })
  permissionId: number;

  @ManyToOne(() => SubscriptionTierEntity, (st) => st.tierPermissions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_tier_id' })
  subscriptionTier: SubscriptionTierEntity;

  @ManyToOne(() => PermissionEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;
}
