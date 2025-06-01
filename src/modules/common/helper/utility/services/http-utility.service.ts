import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { TCustomRequest } from '@/modules/app/auth';
import { parse } from 'useragent';

import { DeviceInfo } from '../types';

/**
 * Service for handling HTTP requests related utils
 * @class HttpUtilityService
 */
@Injectable({ scope: Scope.REQUEST })
export class HttpUtilityService {
  public constructor(
    @Inject(REQUEST) private readonly _request: Request | TCustomRequest
  ) {}
  /**
   * Extracts client device information from request headers
   * @returns {DeviceInfo} - Client device information
   */
  public getClientDeviceInfo(): DeviceInfo {
    // Extract client device info from request headers
    const agent = parse(
      this._request.headers['user-agent'],
      this._request.query.jsuseragent as string
    );
    const ipAddress = this._request.ip || 'unknown';

    const userAgent = agent.family;
    const platform = agent.device.toString() + '/' + agent.os.toString();

    return { userAgent, ipAddress, platform };
  }
}
