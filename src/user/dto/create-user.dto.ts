// =====================================================================
// create-user.dto.ts - body of POST /user (admin-only route)
// =====================================================================
// NB: this is NOT the DTO used by the public registration; that one is
// RegisterDto in the auth folder. There is no `role` field here either:
// because of whitelist: true, a `role` sent by the client is dropped.

import { IsString, IsNotEmpty, IsEmail } from 'class-validator'

export class CreateUserDto {
    @IsString() @IsNotEmpty()
    username!: string;

    // WARNING (see the review): UserService just saves what it receives, so a
    // user created through POST /user (or edited through PATCH /user/:id) gets
    // a CLEAR-TEXT password. Only /auth/register hashes with bcrypt.
    @IsString() @IsNotEmpty()
    password!: string;

    // @IsEmail checks the format (something@domain.tld).
    @IsEmail()
    email!: string;
}
