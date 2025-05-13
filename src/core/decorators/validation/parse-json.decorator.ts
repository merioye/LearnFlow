import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

/**
 * Custom dto property decorator to parse JSON string value.
 * @returns {ReturnType<typeof applyDecorators>} The decorated function.
 */
export function ParseJson(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    Transform(({ value }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return typeof value === 'string' ? JSON.parse(value) : value;
      } catch {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value; // Let class-validator handle invalid values
      }
    })
  );
}
