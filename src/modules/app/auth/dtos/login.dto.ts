import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { TrimString } from '@/core/decorators';

export class LoginDto {
  @TrimString()
  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @TrimString()
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}
