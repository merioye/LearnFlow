import { HttpStatus } from '@nestjs/common';

import { CustomError } from '../custom.error';
import { InternalServerError } from '../internal-server.error';

describe('InternalServerError', () => {
  describe('constructor', () => {
    it('should create an instance with default message', () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(InternalServerError);
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe('Internal Server Exception');
      expect(error.name).toBe('InternalServerException');
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should create an instance with custom message', () => {
      const customMessage = 'Something went wrong';
      const error = new InternalServerError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.name).toBe('InternalServerException');
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should maintain proper prototype chain', () => {
      const error = new InternalServerError();

      expect(Object.getPrototypeOf(error)).toBe(InternalServerError.prototype);
      expect(error instanceof InternalServerError).toBe(true);
      expect(error instanceof CustomError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should work correctly with catch blocks', () => {
      const error = new InternalServerError();

      try {
        throw error;
        /* eslint-disable jest/no-conditional-expect */
      } catch (e) {
        expect(e).toBe(error);
        expect(e instanceof InternalServerError).toBe(true);
        expect(e instanceof CustomError).toBe(true);
        expect(e instanceof Error).toBe(true);
        expect((e as InternalServerError).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    });
  });
});
