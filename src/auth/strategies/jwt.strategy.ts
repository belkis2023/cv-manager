//checks the token on every protected request
// =====================================================================
// jwt.strategy.ts - Passport strategy "jwt" (runs on EVERY protected request)
// =====================================================================
// PASSPORT is an authentication library built around STRATEGIES: one strategy
// = one way to authenticate (password, JWT, Google...). @nestjs/passport wraps
// them as Nest classes. Two moments in our app:
//   - LocalStrategy: once, at LOGIN (check the password)
//   - JwtStrategy  : on every later request (check the token)

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
// PassportStrategy(Strategy) turns the passport-jwt Strategy into a Nest
// class; it is registered under the default name 'jwt', which is what
// AuthGuard('jwt') looks for.
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
            // WHERE the token is: the header  Authorization: Bearer <token>.
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // false = reject expired tokens (the 1h limit is enforced).
            ignoreExpiration: false,
            // The key used to VERIFY the signature. It must be exactly the
            // secret used to sign (JWT_SECRET in .env). If someone alters the
            // token, the signature no longer matches and the request gets 401.
            secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
        })
    }

      // Called only if the signature and expiry are valid
    // `payload` = the decoded content of the token (what login() put in it).
    // What we RETURN here becomes `req.user` for the rest of the request.
    // We rename `sub` to a clearer `userId`. No database query is made:
    // the server trusts the signed token (stateless).
    validate(payload: { sub: number; username: string; role: string }) {
        return { userId: payload.sub, username: payload.username, role: payload.role };
    }

}