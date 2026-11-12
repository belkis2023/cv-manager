// =====================================================================
// login.dto.ts - the shape of a login request body
// =====================================================================
// NOTE: nothing uses this class any more. Since the LocalAuthGuard (Passport)
// reads and checks the credentials before the controller runs, the
// ValidationPipe never gets to validate a LoginDto. It was used by the first
// version of login (before Passport, see the commented code in auth.service.ts).
// The slide asks to "define your DTOs", so it is kept as documentation.

import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString() @IsNotEmpty()
  username!: string;

  @IsString() @IsNotEmpty()
  password!: string;
}