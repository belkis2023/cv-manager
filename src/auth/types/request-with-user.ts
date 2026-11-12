import type { Request } from 'express';

export interface JwtUser {
  userId: number;
  username: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user: JwtUser;
}

export interface LoginRequest extends Request {
  user: { id: number; username: string; role: string };
}