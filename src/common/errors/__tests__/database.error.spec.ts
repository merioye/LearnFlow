import { HttpStatus } from '@nestjs/common';

import { CustomError } from '../custom.error';
import { DatabaseError } from '../database.error';

describe('DatabaseError', () => {
  describe('constructor', () => {
    it('should create an instance with default message', () => {
      const error = new DatabaseError();

      expect(error).toBeInstanceOf(DatabaseError);
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe('Database Exception');
      expect(error.name).toBe('DatabaseException');
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should create an instance with custom message', () => {
      const customMessage = 'Operation failed';
      const error = new DatabaseError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.name).toBe('DatabaseException');
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should maintain proper prototype chain', () => {
      const error = new DatabaseError();

      expect(Object.getPrototypeOf(error)).toBe(DatabaseError.prototype);
      expect(error instanceof DatabaseError).toBe(true);
      expect(error instanceof CustomError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should work correctly with catch blocks', () => {
      const error = new DatabaseError();

      try {
        throw error;
        /* eslint-disable jest/no-conditional-expect */
      } catch (e) {
        expect(e).toBe(error);
        expect(e instanceof DatabaseError).toBe(true);
        expect(e instanceof CustomError).toBe(true);
        expect(e instanceof Error).toBe(true);
        expect((e as DatabaseError).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    });
  });
});
