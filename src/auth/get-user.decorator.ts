import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the user from the request object.
 * This decorator can be used in controller methods to get the authenticated user.
 * 
 * Usage: @GetUser() user: User
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
); 