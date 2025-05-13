import { HttpStatus } from '@nestjs/common';

import { CustomError } from '../custom.error';
import { NotFoundError } from '../not-found.error';

describe('NotFoundError', () => {
  describe('constructor', () => {
    it('should create an instance with default message', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(NotFoundError);
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe('Not Found');
      expect(error.name).toBe('NotFoundException');
      expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should create an instance with custom message', () => {
      const customMessage = 'Resource not found';
      const error = new NotFoundError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.name).toBe('NotFoundException');
      expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should maintain proper prototype chain', () => {
      const error = new NotFoundError();

      expect(Object.getPrototypeOf(error)).toBe(NotFoundError.prototype);
      expect(error instanceof NotFoundError).toBe(true);
      expect(error instanceof CustomError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should work correctly with catch blocks', () => {
      const error = new NotFoundError();

      try {
        throw error;
        /* eslint-disable jest/no-conditional-expect */
      } catch (e) {
        expect(e).toBe(error);
        expect(e instanceof NotFoundError).toBe(true);
        expect(e instanceof CustomError).toBe(true);
        expect(e instanceof Error).toBe(true);
        expect((e as NotFoundError).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
