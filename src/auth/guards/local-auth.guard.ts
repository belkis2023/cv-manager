
// =====================================================================
// local-auth.guard.ts - guard used ONLY on POST /auth/login
// =====================================================================
// Same idea as JwtAuthGuard, but it triggers the strategy named 'local'
// (LocalStrategy = username + password check).
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}