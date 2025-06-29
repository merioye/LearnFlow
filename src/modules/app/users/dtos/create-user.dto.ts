import { TrimString, ValidateIfPresent } from '@/core/decorators';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

import { Role } from '@/enums';

export class CreateUserDto {
  @TrimString()
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @TrimString()
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @TrimString()
  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @TrimString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: 'Password must be strong' }
  )
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ValidateIfPresent()
  @TrimString()
  @IsEnum(Role, {
    message: `Invalid role, allowed values are ${Object.values(Role)?.join(', ')}`,
  })
  role?: Role = Role.STUDENT;
}
