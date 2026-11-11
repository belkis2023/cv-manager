import {NestFactory} from '@nestjs/core'
import {getRepositoryToken} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {randEmail, randFirstName, randJobTitle, randLastName, randNumber, randPassword, randUserName} from '@ngneat/falso'

import {AppModule} from '../app.module'
import { SkillService } from '../skill/skill.service'
import { UserService } from '../user/user.service'
import { Cv } from '../cv/entities/cv.entity'
import { Skill } from '../skill/entities/skill.entity'
import { User } from '../user/entities/user.entity'

const SKILLS = [
    'NestJS', 'Angular', 'React', 'Node.js',
    'TypeScript', 'PostgreSQL', 'Docker', 'Git',
];

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const skillService = app.get(SkillService);
    const userService = app.get(UserService);
    const cvRepository = app.get<Repository<Cv>>(getRepositoryToken(Cv));
    
    //skills
    const skills: Skill[] = [];
    for (const designation of SKILLS) {
        skills.push(await skillService.create({ designation }));
    }

    //users
    const users: User[] = [];
    for (let i=0; i<5; i++) {
        users.push(
            await userService.create({
                username: `${randUserName()}${i}`,
                email: `${i}${randEmail()}`,
                password: String(randPassword()),
            }),
        );
    }

    //cvs: each one gets an owenr and 2-4 skills
    for (let i=0; i<15; i++) {
        const cv = cvRepository.create({
            name: randLastName(),
            firstname: randFirstName(),
            age: randNumber({ min: 18, max: 60 }),
            cin: String(randNumber({ min: 10000000, max: 99999999 })),
            job: randJobTitle(),
            user: users[i % users.length],
            //the fuck???
            skills: [...skills].sort(() => Math.random() - 0.5).slice(0, randNumber({ min: 2, max: 4 })),
        });
        await cvRepository.save(cv);
    }

    console.log('seed done: 8 skills, 5 users, 15 cvs');
    await app.close();
    
}

bootstrap();
