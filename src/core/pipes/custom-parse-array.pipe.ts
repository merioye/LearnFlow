import {
  ArgumentMetadata,
  Injectable,
  ParseArrayPipe,
  PipeTransform,
} from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';

import { TErrorFormat } from '@/types';

/**
 * Custom Parse Array Pipe
 *
 * This pipe extends the built-in ParseArrayPipe and throws a custom validation
 * error if the input value is not a valid array or its items don't match the
 * specified type.
 *
 * @class CustomParseArrayPipe
 * @extends {ParseArrayPipe}
 * @implements {PipeTransform}
 */
@Injectable()
export class CustomParseArrayPipe
  extends ParseArrayPipe
  implements PipeTransform
{
  /**
   * Transforms the input value to an array.
   * If the transformation fails, it throws a RequestValidationError with the
   * corresponding error messages.
   *
   * @param value - The value to be transformed.
   * @param metadata - The metadata of the input value.
   * @returns The transformed array value.
   * @throws {RequestValidationError} - If the transformation fails.
   */
  public async transform(
    value: any,
    metadata: ArgumentMetadata
  ): Promise<any[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await super.transform(value, metadata);
    } catch {
      const { data, type } = metadata;
      const errors: TErrorFormat[] = [
        {
          message: `${data} is not a valid array`,
          field: data || '',
          location: type,
          stack: null,
        },
      ];
      throw new RequestValidationError(errors);
    }
  }
}
