import { HttpStatus } from '@nestjs/common';

import { BadRequestError } from '../bad-request.error';
import { CustomError } from '../custom.error';

describe('BadRequestError', () => {
  describe('constructor', () => {
    it('should create an instance with default message', () => {
      const error = new BadRequestError();

      expect(error).toBeInstanceOf(BadRequestError);
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe('Bad Request Exception');
      expect(error.name).toBe('BadRequestException');
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should create an instance with custom message', () => {
      const customMessage = 'Invalid input data';
      const error = new BadRequestError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.name).toBe('BadRequestException');
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should maintain proper prototype chain', () => {
      const error = new BadRequestError();

      expect(Object.getPrototypeOf(error)).toBe(BadRequestError.prototype);
      expect(error instanceof BadRequestError).toBe(true);
      expect(error instanceof CustomError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should work correctly with catch blocks', () => {
      const error = new BadRequestError();

      try {
        throw error;
        /* eslint-disable jest/no-conditional-expect */
      } catch (e) {
        expect(e).toBe(error);
        expect(e instanceof BadRequestError).toBe(true);
        expect(e instanceof CustomError).toBe(true);
        expect(e instanceof Error).toBe(true);
        expect((e as BadRequestError).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
