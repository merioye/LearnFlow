import { Global, Module } from '@nestjs/common';

import { UsersService } from './services';
import { UsersController } from './users.controller';

@Global()
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
