import { NextFunction, Request, Response } from 'express';
import * as cls from 'cls-hooked';

import { NS_REQUEST } from '@/constants';

export const RequestContextNamespace = cls.createNamespace('request-context');

export function requestContextMiddleware(
  req: Request,
  _: Response,
  next: NextFunction
): void {
  RequestContextNamespace.run(() => {
    RequestContextNamespace.set(NS_REQUEST, req);
    next();
  });
}
