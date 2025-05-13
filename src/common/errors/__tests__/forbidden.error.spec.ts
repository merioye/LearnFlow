import { HttpStatus } from '@nestjs/common';

import { CustomError } from '../custom.error';
import { ForbiddenError } from '../forbidden.error';

describe('ForbiddenError', () => {
  describe('constructor', () => {
    it('should create an instance with default message', () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe('Action Forbidden');
      expect(error.name).toBe('ForbiddenException');
      expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
    });

    it('should create an instance with custom message', () => {
      const customMessage = 'You are not authorized to access this resource';
      const error = new ForbiddenError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.name).toBe('ForbiddenException');
      expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
    });

    it('should maintain proper prototype chain', () => {
      const error = new ForbiddenError();

      expect(Object.getPrototypeOf(error)).toBe(ForbiddenError.prototype);
      expect(error instanceof ForbiddenError).toBe(true);
      expect(error instanceof CustomError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should work correctly with catch blocks', () => {
      const error = new ForbiddenError();

      try {
        throw error;
        /* eslint-disable jest/no-conditional-expect */
      } catch (e) {
        expect(e).toBe(error);
        expect(e instanceof ForbiddenError).toBe(true);
        expect(e instanceof CustomError).toBe(true);
        expect(e instanceof Error).toBe(true);
        expect((e as ForbiddenError).getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });
  });
});
