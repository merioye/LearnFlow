// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ILogger, InjectLogger } from '@/modules/common/logger';
// import { Socket } from 'socket.io';

// import { Role } from '@/enums';

// /**
//  * WebSocketRoleGuard - Role-based access control for WebSocket events
//  *
//  * @class WebSocketRoleGuard
//  * @implements {CanActivate}
//  */
// @Injectable()
// export class WebSocketRoleGuard implements CanActivate {
//   public constructor(
//     @InjectLogger() private readonly _logger: ILogger,
//     private readonly _reflector: Reflector
//   ) {}

//   public async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredRoles = this._reflector.get<Role[]>(
//       'roles',
//       context.getHandler()
//     );

//     if (!requiredRoles) {
//       return true; // No roles required
//     }

//     const client: Socket = context.switchToWs().getClient();
//     const user = client.data.user;

//     if (!user || !user.roles) {
//       this._logger.warn(`No user roles found for socket: ${client.id}`);
//       return false;
//     }

//     const hasRole = requiredRoles.some((role) => user.roles.includes(role));

//     if (!hasRole) {
//       this._logger.warn(
//         `Insufficient permissions for socket: ${client.id}, required: ${requiredRoles.join(', ')}`
//       );
//     }

//     return hasRole;
//   }
// }
