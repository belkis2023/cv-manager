// =====================================================================
// admin.guard.ts - OUR OWN guard (slide 13)
// =====================================================================
// A GUARD is a class with ONE job: decide if a request may reach the route
// (return true) or not (throw an exception, here 403). It runs BEFORE the
// controller method. `implements CanActivate` forces us to write canActivate().

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RequestWithUser } from '../types/request-with-user';

@Injectable()
export class AdminGuard implements CanActivate {
    // ExecutionContext is a generic "what is being executed" object (Nest
    // guards also work for WebSockets/microservices), so we ask it for the
    // HTTP request: switchToHttp().getRequest(). The <RequestWithUser> tells
    // TypeScript that the request has a typed `user`.
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        // Slide 13's remark: "the owner can add roles at any time". So we do
        // NOT write "if role is not 'user' then allow" (a new role such as
        // 'moderator' would silently become admin). We allow ONLY the exact
        // value 'admin'; every other role, existing or future, is refused by
        // default. `?.` avoids a crash if req.user is undefined.
        // IMPORTANT: this guard must run AFTER JwtAuthGuard (which fills
        // req.user); that's why they are listed in that order in UserController.
        if(req.user?.role !== 'admin') {
            // 403 Forbidden = "I know who you are, but you may not do this"
            // (401 means "I don't know who you are").
            throw new ForbiddenException('Admins only');
        }
        return true;
    }
}