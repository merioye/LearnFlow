import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validator constraint for checking if at least one field is provided in a DTO.
 * This constraint validates that the object has at least one property.
 */
@ValidatorConstraint({ name: 'isAtLeastOneFieldProvided', async: false })
export class IsAtLeastOneFieldProvidedConstraint
  implements ValidatorConstraintInterface
{
  /**
   * Validates that at least one field in the object is provided.
   *
   * @param _ - The value of the property being decorated (unused in this case)
   * @param args - Validation arguments containing the object being validated
   * @returns `true` if at least one field has a non-empty value, `false` otherwise
   */
  public validate(_: unknown, args: ValidationArguments): boolean {
    const object = args.object;
    const values = Object.values(object);

    // Check if the object has any properties
    const hasAnyProperties = values?.length > 0;
    const isAnyPropertyValueProvided = values?.some(
      (value) => value !== undefined
    );

    return hasAnyProperties && isAnyPropertyValueProvided;
  }

  /**
   * Provides the default error message when validation fails.
   *
   * @returns A string containing the error message
   */
  public defaultMessage(): string {
    return 'At least one field must be provided';
  }
}

/**
 * Class Decorator that ensures at least one field in a DTO is provided.
 *
 * @param validationOptions - Options to customize the validation behavior and error messages
 * @returns A class decorator function
 *
 * @example
 * ```typescript
 * \@IsAtLeastOneFieldProvided()
 * export class UpdateUserDto {
 *   \@IsOptional()
 *   \@IsString()
 *   name?: string;
 *
 *   \@IsOptional()
 *   \@IsNumber()
 *   age?: number;
 * }
 * ```
 *
 * @throws {ValidationError} When no fields are provided
 *
 * @remarks
 * This decorator is particularly useful for PATCH operations where at least one field
 * should be provided for update, but all fields are optional.
 */
export function IsAtLeastOneFieldProvided(
  validationOptions?: ValidationOptions
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return function (target: Function): void {
    registerDecorator({
      name: 'isAtLeastOneFieldProvided',
      target: target,
      propertyName: '',
      options: validationOptions,
      constraints: [],
      validator: IsAtLeastOneFieldProvidedConstraint,
    });
  };
}
