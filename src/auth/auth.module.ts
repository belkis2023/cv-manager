// =====================================================================
// auth.module.ts - the Authentication feature "box"
// =====================================================================
// Slide 10: "Créer un Module AuthModule". It groups everything about proving
// who you are: register, login, the two Passport strategies and the JWT config.
//
// BIG PICTURE of authentication in this app:
//   1. POST /auth/register : create a user, password stored as a bcrypt hash.
//   2. POST /auth/login    : LocalStrategy checks username+password; if OK the
//                            server SIGNS a JWT and returns it.
//   3. Every protected request sends  Authorization: Bearer <token> ;
//      JwtStrategy verifies the signature and expiry, and puts
//      { userId, username, role } in req.user. No database call is needed:
//      the server is "stateless" (it keeps no session).

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({

  //the fuck does this do?  ->  answer, import by import:
  imports: [
    // Gives AuthService the Repository<User> (to look users up / create them).
    TypeOrmModule.forFeature([User]),
    // Registers Passport so the AuthGuard('local') / AuthGuard('jwt') classes work.
    PassportModule,
    // Configures JwtService, the class that SIGNS tokens (jwtService.sign).
    //  - registerAsync + inject ConfigService: the secret is read from .env
    //    (JWT_SECRET); it must never be written in the code or committed.
    //  - imports: [ConfigModule]: makes ConfigService available to the factory
    //    (redundant here because ConfigModule is global, but harmless).
    //  - getOrThrow: crash at startup if JWT_SECRET is missing, instead of
    //    silently signing with `undefined`.
    //  - expiresIn: '1h': the token stops working after one hour (a stolen
    //    token has a limited life; real apps add refresh tokens).
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),

  ],
  controllers: [AuthController],
  // The strategies are providers: Nest must instantiate them at startup so
  // that Passport registers them under the names 'local' and 'jwt'.
  providers: [AuthService, LocalStrategy, JwtStrategy],
  // Lets other modules that import AuthModule inject AuthService (not used
  // by the other modules at the moment).
  exports: [AuthService],
})
export class AuthModule {}
