// =====================================================================
// create-user.dto.ts - body of POST /user
// =====================================================================
// DTO = Data Transfer Object: the SHAPE of a request body, checked by the
// global ValidationPipe (wrong body -> automatic HTTP 400).

import { IsString, IsNotEmpty, IsEmail } from 'class-validator'

export class CreateUserDto {
    @IsString() @IsNotEmpty()
    username!: string;

    // On master the password is saved as received (no hashing yet).
    @IsString() @IsNotEmpty()
    password!: string;

    // @IsEmail checks the format (something@domain.tld).
    @IsEmail()
    email!: string;
}
