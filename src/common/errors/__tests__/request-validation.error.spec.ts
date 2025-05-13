import { HttpStatus } from '@nestjs/common';

import { TErrorFormat } from '@/types';

import { RequestValidationError } from '../request-validation.error';

describe('RequestValidationError', () => {
  describe('constructor', () => {
    it('should create an instance with validation errors', () => {
      const validationErrors: TErrorFormat[] = [
        {
          message: 'Invalid email format',
          field: 'email',
          location: 'body',
          stack: null,
        },
      ];

      const error = new RequestValidationError(validationErrors);

      expect(error).toBeInstanceOf(RequestValidationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Validation Failed Exception');
      expect(error.name).toBe('RequestValidationException');
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(error.errors).toBe(validationErrors);
    });

    it('should maintain proper prototype chain', () => {
      const validationErrors: TErrorFormat[] = [
        {
          message: 'Invalid email format',
          field: 'email',
          location: 'body',
          stack: null,
        },
      ];
      const error = new RequestValidationError(validationErrors);

      expect(Object.getPrototypeOf(error)).toBe(
        RequestValidationError.prototype
      );
      expect(error instanceof RequestValidationError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should handle multiple validation errors', () => {
      const validationErrors: TErrorFormat[] = [
        {
          message: 'Invalid email format',
          field: 'email',
          location: 'body',
          stack: null,
        },
        {
          message: 'Password too short',
          field: 'password',
          location: 'body',
          stack: null,
        },
      ];

      const error = new RequestValidationError(validationErrors);
      expect(error.errors).toHaveLength(2);
      expect(error.errors).toEqual(validationErrors);
    });
  });

  describe('error handling', () => {
    it('should work correctly with catch blocks', () => {
      const validationErrors: TErrorFormat[] = [
        {
          message: 'Invalid email format',
          field: 'email',
          location: 'body',
          stack: null,
        },
      ];
      const error = new RequestValidationError(validationErrors);

      try {
        throw error;
        /* eslint-disable jest/no-conditional-expect */
      } catch (e) {
        expect(e).toBe(error);
        expect(e instanceof RequestValidationError).toBe(true);
        expect(e instanceof Error).toBe(true);
        expect((e as RequestValidationError).getStatus()).toBe(
          HttpStatus.BAD_REQUEST
        );
        expect((e as RequestValidationError).errors).toBe(validationErrors);
      }
    });
  });
});
