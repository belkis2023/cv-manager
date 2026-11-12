// =====================================================================
// auth.controller.ts - the routes /auth/register, /auth/login, /auth/profile
// =====================================================================

import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
// LoginDto is imported but not used (lint warning): the LocalAuthGuard reads
// the credentials itself, BEFORE any pipe could validate a DTO. The file
// login.dto.ts is kept for documentation of the expected body.
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
// `import type`: these are interfaces. Because `@Req() req: LoginRequest` is
// a decorated parameter and the project has `isolatedModules` +
// `emitDecoratorMetadata` on, TypeScript refuses a normal import for a type
// that doesn't exist at runtime. `import type` says "types only, erase it".
import type { LoginRequest, RequestWithUser } from './types/request-with-user';

// All routes here start with /auth.
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // PUBLIC route (no guard): anyone can create an account.
    // @Body() + RegisterDto -> validated by the global ValidationPipe.
    @Post('register')
    register(@Body() dto: RegisterDto) {return this.authService.register(dto);}


    // LOGIN. What happens, in order:
    //  1. LocalAuthGuard runs LocalStrategy: reads username+password from the
    //     body and checks them (authService.validateUser). Wrong -> 401 and the
    //     method below never runs. Right -> the user is put in req.user.
    //  2. Then login() runs and returns { access_token }.
    // @HttpCode(200): a POST returns 201 "Created" by default, but a login
    // creates nothing, so we answer 200 OK.
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(200)
    //before adding guards
    //login(@Body() dto: LoginDto) {return this.authService.login(dto);}
    //after adding them
    // (The commented line is the first version: it received the DTO and
    // checked the password inside. Now the guard already did that job and
    // hands us the verified user in req.user, which is typed by LoginRequest.)
    login(@Req() req: LoginRequest) {return this.authService.login(req.user);}

    //test route to prove the token works.
    // PROTECTED route: JwtAuthGuard demands a valid  Authorization: Bearer <token>
    // header and fills req.user from the token. It returns that user, which
    // proves the token was accepted. 401 if the token is missing, wrong or expired.
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    profile(@Req() req: RequestWithUser) {
        return req.user;
    }


}
