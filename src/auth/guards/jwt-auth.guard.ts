// =====================================================================
// jwt-auth.guard.ts - "you must be logged in" guard
// =====================================================================
// AuthGuard('jwt') is a ready-made guard from @nestjs/passport that runs the
// Passport strategy NAMED 'jwt' (our JwtStrategy). Extending it gives us a
// short class name to use in @UseGuards(JwtAuthGuard).
// Result: valid token -> request continues with req.user filled;
//         missing/invalid/expired token -> 401 Unauthorized.

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}