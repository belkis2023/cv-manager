import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
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

    async login(dto: LoginDto) {
        const user = await this.userRepository.findOne({ where: { username: dto.username } });
        if(!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const { password, ...result } = user;
        return result; 
    }
}
