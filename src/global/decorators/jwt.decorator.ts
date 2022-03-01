import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const JwtToken = createParamDecorator(
  (data: "user", ctx: ExecutionContext) => {
    const request:Request = ctx.switchToHttp().getRequest();
    return request[data]
  }
);