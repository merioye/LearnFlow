import { Global, Module } from '@nestjs/common';

import { DateTimeModule } from './date-time';
import { UtilityModule } from './utility';

@Global()
@Module({
  imports: [DateTimeModule, UtilityModule],
})
export class HelperModule {}
