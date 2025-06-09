import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from 'generated/prisma';

interface AuthenticatedRequest extends Request {
  user: User;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof User | undefined,
    ctx: ExecutionContext,
  ): User | User[keyof User] => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user: User = request.user;

    if (!user) {
      throw new UnauthorizedException('User not found in request context');
    }

    return data ? user[data] : user;
  },
);
