// =====================================================================
// auth.service.ts - register, check credentials, create the JWT
// =====================================================================
// Lint warnings you may be asked about (they are harmless, unused leftovers):
// `UnauthorizedException` and `LoginDto` are imported but no longer used
// (they were used by the first version of login, commented out below).

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// bcrypt: the library that hashes passwords. `import * as bcrypt` takes the
// whole module as one object (bcrypt.hash, bcrypt.compare).
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// JwtService: provided by JwtModule (see auth.module.ts); creates signed tokens.
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,

        private readonly jwtService: JwtService,
    ) {}

    // POST /auth/register
    async register(dto: RegisterDto) {
        // Look for an existing user with the same username OR the same email.
        // An ARRAY in `where` means OR (an object would mean AND).
        const exists = await this.userRepository.findOne({
            where: [{ username: dto.username }, { email: dto.email }],
        });

        // 409 Conflict = "this resource already exists".
        // (Edge case found while testing: a SOFT-DELETED user is invisible to
        // findOne, yet his row still holds the unique username, so
        // re-registering that username gives a 500 from the database.)
        if(exists) throw new ConflictException('Username or email already used');

        // bcrypt.hash(password, 10):
        //  - 10 = "cost": 2^10 rounds of hashing, deliberately slow to make
        //    brute-force attacks expensive.
        //  - bcrypt adds a random SALT automatically and stores it inside the
        //    hash, so two users with the same password get different hashes.
        //  - A hash can't be reversed; to check a password later we hash the
        //    typed one again and compare (bcrypt.compare).
        const hashed = await bcrypt.hash(dto.password, 10);
        // { ...dto, password: hashed }: copy the DTO fields but REPLACE the
        // clear password by the hash. `role` is not in the DTO, so it takes
        // the column default 'user'.
        const user = await this.userRepository.save(
            this.userRepository.create({ ...dto, password: hashed }),
        )

        // Never return the password hash to the client: rest-destructuring
        // pulls `password` out and `result` is the user WITHOUT it.
        // (Lint says `password` is unused: that's the point, we only want to
        // throw it away.)
        const { password, ...result } = user;
        return result;
    }


    // FIRST VERSION of login (before Passport), kept commented by the author.
    // It did everything in one place and returned the user (no token).
    // Replaced by validateUser + login below.
    /* async login(dto: LoginDto) {
        const user = await this.userRepository.findOne({ where: { username: dto.username } });
        if(!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const { password, ...result } = user;
        return result;
    } */

    //these two functions are after adding guards + strategies
    // Split in two on purpose:
    //   validateUser = "is this username/password correct?" (called by LocalStrategy)
    //   login        = "create the token for an already-verified user"

    // Returns the user WITHOUT password, or null if the credentials are wrong.
    // The same `null` is returned for "unknown username" and "wrong password"
    // so an attacker can't tell which usernames exist.
    async validateUser(username: string, password: string) {
        const user = await this.userRepository.findOne({ where: { username } });
        // bcrypt.compare(clearPassword, storedHash) -> true/false.
        if (!user || !(await bcrypt.compare(password, user.password))) return null;
        // `password: _` renames the unwanted field to `_` (the usual name for
        // "unused variable") so that lint doesn't complain.
        const { password: _, ...result } = user;
        return result;
    }

    // Creates the JWT. The PAYLOAD is the data stored inside the token:
    //   sub      = "subject", the standard JWT name for the user id
    //   username, role = extra data we want available on each request
    // The payload is only BASE64-ENCODED, not encrypted: anyone can read it
    // (jwt.io shows it), so NEVER put a password in it. The SIGNATURE (made
    // with JWT_SECRET) only proves it wasn't modified. sign() also adds
    // `iat` (issued at) and `exp` (expiry, 1h from module config).
    // Consequence: the role is a SNAPSHOT. If a user is promoted, his old
    // token keeps the old role until it expires or he logs in again.
    login(user: { id: number; username: string; role: string }) {
        const payload = { sub: user.id, username: user.username, role: user.role };
        return { access_token: this.jwtService.sign(payload) };
    }


}
