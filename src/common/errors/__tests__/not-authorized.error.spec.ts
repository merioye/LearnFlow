import { HttpStatus } from '@nestjs/common';

import { CustomError } from '../custom.error';
import { NotAuthorizedError } from '../not-authorized.error';

describe('NotAuthorizedError', () => {
  describe('constructor', () => {
    it('should create an instance with default message', () => {
      const error = new NotAuthorizedError();

      expect(error).toBeInstanceOf(NotAuthorizedError);
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe('Not Authorized');
      expect(error.name).toBe('NotAuthorizedException');
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should create an instance with custom message', () => {
      const customMessage = 'You are not authorized to access this resource';
      const error = new NotAuthorizedError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.name).toBe('NotAuthorizedException');
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should maintain proper prototype chain', () => {
      const error = new NotAuthorizedError();

      expect(Object.getPrototypeOf(error)).toBe(NotAuthorizedError.prototype);
      expect(error instanceof NotAuthorizedError).toBe(true);
      expect(error instanceof CustomError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should work correctly with catch blocks', () => {
      const error = new NotAuthorizedError();

      try {
        throw error;
        /* eslint-disable jest/no-conditional-expect */
      } catch (e) {
        expect(e).toBe(error);
        expect(e instanceof NotAuthorizedError).toBe(true);
        expect(e instanceof CustomError).toBe(true);
        expect(e instanceof Error).toBe(true);
        expect((e as NotAuthorizedError).getStatus()).toBe(
          HttpStatus.UNAUTHORIZED
        );
      }
    });
  });
});
