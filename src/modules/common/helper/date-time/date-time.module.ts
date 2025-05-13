import { DynamicModule, Global, Module } from '@nestjs/common';

import { DayjsDateTimeAdapter } from './adapters';
import { DATE_TIME, DATE_TIME_ADAPTER } from './constants';
import { IDateTime } from './interfaces';
import { DateTimeService } from './services';

@Global()
@Module({
  providers: [
    {
      provide: DATE_TIME_ADAPTER,
      useClass: DayjsDateTimeAdapter,
    },
    {
      provide: DATE_TIME,
      useClass: DateTimeService,
    },
  ],
  exports: [DATE_TIME],
})
export class DateTimeModule {
  /**
   * Register with custom adapter
   * @param adapter - Custom date time adapter
   */
  static forRoot(adapter: IDateTime): DynamicModule {
    return {
      module: DateTimeModule,
      providers: [
        DateTimeService,
        {
          provide: DATE_TIME_ADAPTER,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          useClass: adapter,
        },
      ],
      exports: [DateTimeService],
    };
  }
}
