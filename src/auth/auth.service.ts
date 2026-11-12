import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,

        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const exists = await this.userRepository.findOne({
            where: [{ username: dto.username }, { email: dto.email }],
        });

        if(exists) throw new ConflictException('Username or email already used');

        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.userRepository.save(
            this.userRepository.create({ ...dto, password: hashed }),
        )

        const { password, ...result } = user;
        return result;
    }


    /* async login(dto: LoginDto) {
        const user = await this.userRepository.findOne({ where: { username: dto.username } });
        if(!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const { password, ...result } = user;
        return result; 
    } */

    //these two functions are after adding guards + strategies
    async validateUser(username: string, password: string) {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) return null;
        const { password: _, ...result } = user;
        return result;
    }

    login(user: { id: number; username: string; role: string }) {
        const payload = { sub: user.id, username: user.username, role: user.role };
        return { access_token: this.jwtService.sign(payload) };
    }


}
