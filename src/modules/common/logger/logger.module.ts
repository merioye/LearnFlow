import { DynamicModule } from '@nestjs/common';

import { LOGGER } from './constants';
import { WinstonLogger } from './loggers';
import { TLoggerModuleOptions } from './types';

/**
 * Global NestJS module for logging
 * This module provides the global Logger instance
 *
 * @module LoggerModule
 */

export class LoggerModule {
  /**
   * Creates a dynamic module for the global Logger instance.
   *
   * @static
   * @param options - The options for the Logger module.
   * @returns The dynamic module for the global Logger instance.
   */
  public static forRoot(options: TLoggerModuleOptions): DynamicModule {
    return {
      global: true,
      module: LoggerModule,
      providers: [
        { provide: LOGGER, useValue: WinstonLogger.getInstance(options) },
      ],
      exports: [LOGGER],
    };
  }
}
