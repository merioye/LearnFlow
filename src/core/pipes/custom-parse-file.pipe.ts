import {
  Injectable,
  ParseFileOptions,
  ParseFilePipe,
  PipeTransform,
} from '@nestjs/common';

import { RequestValidationError } from '@/common/errors';

/**
 * Custom Parse File Pipe
 *
 * This pipe extends the built-in ParseFilePipe and throws a custom validation
 * error if the input value is not a valid file(s).
 *
 * @class CustomParseFilePipe
 * @extends {ParseFilePipe}
 * @implements {PipeTransform}
 */
@Injectable()
export class CustomParseFilePipe
  extends ParseFilePipe
  implements PipeTransform
{
  /**
   * Constructor for the CustomParseFilePipe.
   *
   * @constructor
   * @param fieldName - The name of the field which contains the file(s).
   * @param options - An optional options object for the file(s) validation.
   */
  public constructor(
    private readonly _fieldName: string,
    options?: ParseFileOptions
  ) {
    super(options);
  }

  /**
   * Transforms the input value to a file object with the provided options (validations).
   * If the transformation fails, it throws a RequestValidationError with the corresponding error messages.
   *
   * @param value - The file(s) to be transformed.
   * @returns The transformed file(s).
   * @throws {RequestValidationError} - If the transformation fails.
   */
  public async transform(
    value: Express.Multer.File | Express.Multer.File[]
  ): Promise<Express.Multer.File | Express.Multer.File[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await super.transform(value);
    } catch (err) {
      throw new RequestValidationError([
        {
          message: (err as Error)?.message,
          field: this._fieldName,
          location: 'body',
          stack: null,
        },
      ]);
    }
  }
}
