// =====================================================================
// request-with-user.ts - TypeScript types for `req.user`
// =====================================================================
// Express's default Request type has no `user` property, but Passport adds
// one at runtime. We extend Request to tell TypeScript what `req.user`
// contains, otherwise `req.user.userId` would be a compile error.
// These are INTERFACES: they exist only at compile time (erased from the
// JavaScript), hence `import type` wherever they are imported into a file
// that uses them in a decorated parameter (@Req()).

import type { Request } from 'express';

// What the JwtStrategy puts in req.user after a token is accepted.
export interface JwtUser {
  userId: number;
  username: string;
  role: string;
}

// Request of the PROTECTED routes (guarded by JwtAuthGuard).
export interface RequestWithUser extends Request {
  user: JwtUser;
}

// Request of the LOGIN route. It's a DIFFERENT shape because there the user
// comes from LocalStrategy (the database user: field `id`), not from a token
// (field `userId`).
export interface LoginRequest extends Request {
  user: { id: number; username: string; role: string };
}