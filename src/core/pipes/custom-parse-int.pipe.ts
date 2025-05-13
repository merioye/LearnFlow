import {
  ArgumentMetadata,
  Injectable,
  ParseIntPipe,
  PipeTransform,
} from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';

import { TErrorFormat } from '@/types';

/**
 * Custom Parse Int Pipe
 *
 * This pipe extends the built-in ParseIntPipe and throws a custom validation
 * error if the input value is not a valid integer.
 *
 * @class CustomParseIntPipe
 * @extends {ParseIntPipe}
 * @implements {PipeTransform}
 */
@Injectable()
export class CustomParseIntPipe extends ParseIntPipe implements PipeTransform {
  /**
   * Transforms the input value to a integer.
   * If the transformation fails, it throws a RequestValidationError with the
   * corresponding error messages.
   *
   * @param value - The value to be transformed.
   * @param metadata - The metadata of the input value.
   * @returns The transformed integer value.
   * @throws {RequestValidationError} - If the transformation fails.
   */
  public async transform(
    value: string,
    metadata: ArgumentMetadata
  ): Promise<number> {
    try {
      return await super.transform(value, metadata);
    } catch {
      const { data, type } = metadata;
      const errors: TErrorFormat[] = [
        {
          message: `${data} is not a valid integer`,
          field: data || '',
          location: type,
          stack: null,
        },
      ];
      throw new RequestValidationError(errors);
    }
  }
}
