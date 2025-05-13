import { HttpStatus } from '@nestjs/common';

import { ConflictError } from '../conflict.error';
import { CustomError } from '../custom.error';

describe('ConflictError', () => {
  describe('constructor', () => {
    it('should create an instance with default message', () => {
      const error = new ConflictError();

      expect(error).toBeInstanceOf(ConflictError);
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe('Conflict Exception');
      expect(error.name).toBe('ConflictException');
      expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
    });

    it('should create an instance with custom message', () => {
      const customMessage = 'Email already in use';
      const error = new ConflictError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.name).toBe('ConflictException');
      expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
    });

    it('should maintain proper prototype chain', () => {
      const error = new ConflictError();

      expect(Object.getPrototypeOf(error)).toBe(ConflictError.prototype);
      expect(error instanceof ConflictError).toBe(true);
      expect(error instanceof CustomError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should work correctly with catch blocks', () => {
      const error = new ConflictError();

      try {
        throw error;
        /* eslint-disable jest/no-conditional-expect */
      } catch (e) {
        expect(e).toBe(error);
        expect(e instanceof ConflictError).toBe(true);
        expect(e instanceof CustomError).toBe(true);
        expect(e instanceof Error).toBe(true);
        expect((e as ConflictError).getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });
  });
});
