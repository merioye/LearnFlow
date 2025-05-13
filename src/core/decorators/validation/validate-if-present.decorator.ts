import { ValidateIf } from 'class-validator';

/**
 * Custom decorator that runs validation only if the value is present and not undefined.
 * Combines ValidateIf with a check for undefined values.
 *
 * @example
 * ```typescript
 * export class UpdateUserDto {
 *   @ValidateIfPresent()
 *   @IsString()
 *   @IsNotEmpty()
 *   name?: string;
 * }
 * ```
 *
 * Valid cases:
 * {}                // Validation skipped
 * { name: "John" }  // Validation runs
 *
 * Invalid cases:
 * { name: null }    // Validation fails
 * { name: "" }     // Validation fails
 *
 * @returns PropertyDecorator
 */
export function ValidateIfPresent(): PropertyDecorator {
  return ValidateIf((_, value) => value !== undefined);
}
