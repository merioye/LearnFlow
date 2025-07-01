import { PartialType } from '@nestjs/mapped-types';

import { IsAtLeastOneFieldProvided } from '@/core/decorators';

import { CreateCourseDto } from './create-course.dto';

@IsAtLeastOneFieldProvided()
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
