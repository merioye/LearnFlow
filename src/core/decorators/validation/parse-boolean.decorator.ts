import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

/**
 * Custom dto property decorator to parse boolean value.
 * @returns {ReturnType<typeof applyDecorators>} The decorated function.
 */
export function ParseBoolean(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    Transform(({ value }) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value; // Let class-validator handle invalid values
    })
  );
}
