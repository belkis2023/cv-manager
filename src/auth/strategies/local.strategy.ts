//checks username and password at login
// =====================================================================
// local.strategy.ts - Passport strategy "local" (runs only at login)
// =====================================================================
// "local" = the classic username + password check (as opposed to a token).

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    // AuthService is injected by Nest (that's why LocalStrategy is a provider
    // in AuthModule).
    constructor(private readonly authService: AuthService) {
        // passport-local needs no options: by default it reads the fields
        // named "username" and "password" in the JSON body.
        super(); //defaults: reads "username" and "password" from the body
    }

    // Passport calls validate(username, password) with the values it read.
    async validate(username: string, password: string) {
        const user = await this.authService.validateUser(username, password);
        // null -> wrong credentials -> 401 Unauthorized.
        if (!user) throw new UnauthorizedException('Invalid credentials');
        return user; // Passport attaches this to request.user
    }
}