import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

/**
 * Custom decorator to trim string whitespaces.
 */
export function TrimString(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    Transform(({ value }) =>
      typeof value === 'string' ? value?.trim() : (value as unknown)
    )
  );
}
