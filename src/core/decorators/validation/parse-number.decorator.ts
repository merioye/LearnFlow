import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

/**
 * Custom dto property decorator to parse number value.
 * @returns {ReturnType<typeof applyDecorators>} The decorated function.
 */
export function ParseNumber(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    Transform(({ value }) => {
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return Number(value);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value; // Let class-validator handle invalid values
    })
  );
}
