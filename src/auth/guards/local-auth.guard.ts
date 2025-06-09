import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'generated/prisma';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = User>(
    err: unknown,
    user: TUser | false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw (err as Error) || new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
