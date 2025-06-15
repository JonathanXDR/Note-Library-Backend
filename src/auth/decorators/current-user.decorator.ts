import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'generated/prisma';
export const CurrentUser = createParamDecorator(
  <T extends keyof User | undefined = undefined>(
    data: T,
    ctx: ExecutionContext,
  ): T extends keyof User ? User[T] : User | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as User | undefined;

    return (data ? user?.[data] : user) as T extends keyof User
      ? User[T]
      : User | undefined;
  },
);
