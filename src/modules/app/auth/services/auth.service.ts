import { Injectable } from '@nestjs/common';
import { MetricType, RecordMetric } from '@/modules/common/metrics';

import { UsersMetrics } from '../metrics';

@Injectable()
export class AuthService {
  public constructor(private readonly _usersMetrics: UsersMetrics) {}

  @RecordMetric('user_creation', MetricType.HISTOGRAM, () => ({
    source: 'api',
  }))
  public registerUser(): void {
    // Implementation

    // Track successful registration
    this._usersMetrics.trackRegistration('success');
  }

  public findAllUsers(): any[] {
    // Implementation
    const users: any[] = [];

    // Track active users count
    this._usersMetrics.trackActiveUsers(users.length);

    return users;
  }
}
