import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { LoginRequest, RequestWithUser } from './types/request-with-user';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {return this.authService.register(dto);}
    
    
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(200)
    //before adding guards
    //login(@Body() dto: LoginDto) {return this.authService.login(dto);}
    //after adding them
    login(@Req() req: LoginRequest) {return this.authService.login(req.user);}

    //test route to prove the token works.
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    profile(@Req() req: RequestWithUser) {
        return req.user;
    }


}

