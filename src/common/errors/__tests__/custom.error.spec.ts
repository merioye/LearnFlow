import { HttpStatus } from '@nestjs/common';

import { CustomError } from '../custom.error';

describe('CustomError', () => {
  const errorMessage = 'Test error message';
  const errorName = 'TestError';
  const statusCode = HttpStatus.BAD_REQUEST;

  describe('constructor', () => {
    it('should create an instance with the correct properties', () => {
      const error = new CustomError(errorMessage, errorName, statusCode);

      expect(error).toBeInstanceOf(CustomError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(errorMessage);
      expect(error.name).toBe(errorName);
    });

    it('should capture stack trace', () => {
      const error = new CustomError(errorMessage, errorName, statusCode);

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain(errorName);
    });

    it('should maintain proper prototype chain', () => {
      const error = new CustomError(errorMessage, errorName, statusCode);

      expect(Object.getPrototypeOf(error)).toBe(CustomError.prototype);
      expect(error instanceof CustomError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('should return the correct status code', () => {
      const error = new CustomError(errorMessage, errorName, statusCode);

      expect(error.getStatus()).toBe(statusCode);
    });
  });

  describe('error inheritance', () => {
    it('should work correctly with catch blocks', () => {
      const error = new CustomError(errorMessage, errorName, statusCode);

      try {
        throw error;
        /* eslint-disable jest/no-conditional-expect */
      } catch (e) {
        expect(e).toBe(error);
        expect(e instanceof CustomError).toBe(true);
        expect(e instanceof Error).toBe(true);
      }
    });
  });
});
