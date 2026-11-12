// =====================================================================
// register.dto.ts - body of POST /auth/register
// =====================================================================
// Security point: there is NO `role` field. With whitelist: true (main.ts) a
// client sending {"role":"admin"} has it silently removed, so nobody can make
// themselves admin when registering (tested: the user was created as 'user').

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RegisterDto {
    @IsString() @IsNotEmpty()
    username!: string;

    @IsEmail()
    email!: string;

    // At least 6 characters. (Not a requirement of the slides: our choice.)
    @IsString() @MinLength(6)
    password!: string;
}