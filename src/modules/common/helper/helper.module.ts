import { Global, Module } from '@nestjs/common';

import { DateTimeModule } from './date-time';

@Global()
@Module({
  imports: [DateTimeModule],
})
export class HelperModule {}
