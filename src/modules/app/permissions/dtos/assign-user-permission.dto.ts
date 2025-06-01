import { IsArray, IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AssignUserPermissionDto {
  @IsPositive({ message: 'User id must be positive' })
  @IsInt({ message: 'User id must be a number' })
  @IsNotEmpty({ message: 'User id is required' })
  userId!: number;

  @IsArray({
    message: 'Permission ids must be an array',
  })
  @IsPositive({
    each: true,
    message: 'Permission ids must be positive',
  })
  @IsInt({
    each: true,
    message: 'Permission ids must be a number',
  })
  @IsNotEmpty({
    each: true,
    message: 'Permission ids is required',
  })
  permissionIds!: number[];
}
