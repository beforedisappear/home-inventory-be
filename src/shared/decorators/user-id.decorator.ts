import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Request is not authenticated');
    }

    const id = user._id?.toString() ?? user.sub;

    if (!id) {
      throw new UnauthorizedException('User id missing in token payload');
    }

    return id;
  },
);
