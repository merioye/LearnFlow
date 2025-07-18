import { Module } from '@nestjs/common';

import { CoursesController } from './courses.controller';
import { CoursesService } from './services';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
