// =====================================================================
// cv.seeder.ts - STANDALONE APPLICATION that fills the database (slides 5-8)
// =====================================================================
// Run with:  npm run seed:cvs   (script "ts-node src/commands/cv.seeder.ts")
//
// A "standalone application" is a Nest app WITHOUT a web server: just the
// IoC container (modules + dependency injection), enough to reuse our
// services in a script. It is built with createApplicationContext instead of
// NestFactory.create.
// Reminder (slides): all imports here must be RELATIVE ('../...'), because
// ts-node runs this file outside Nest's build.

import {NestFactory} from '@nestjs/core'
// getRepositoryToken(Cv) = the "name" under which Nest registered the
// Repository<Cv>; lets us fetch it from the container by hand.
import {getRepositoryToken} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
// falso: library of fake-data generators; each randXxx() returns one random
// realistic value. `randPassword` is imported but unused now (lint warning).
import {randEmail, randFirstName, randJobTitle, randLastName, randNumber, randPassword, randUserName} from '@ngneat/falso'

import {AppModule} from '../app.module'
import { SkillService } from '../skill/skill.service'
import { UserService } from '../user/user.service'
import { Cv } from '../cv/entities/cv.entity'
import { Skill } from '../skill/entities/skill.entity'
import { User } from '../user/entities/user.entity'

import * as bcrypt from 'bcrypt';

// The 8 skills created every run.
const SKILLS = [
    'NestJS', 'Angular', 'React', 'Node.js',
    'TypeScript', 'PostgreSQL', 'Docker', 'Git',
];

async function bootstrap() {
    // Build the container from AppModule: same modules, same .env, same
    // database connection as the real app, but NO HTTP server and no port.
    const app = await NestFactory.createApplicationContext(AppModule);

    // app.get(Class) pulls an instance out of the container (this is the
    // `get` method from the slide). It searches all modules by default.
    const skillService = app.get(SkillService);
    const userService = app.get(UserService);
    // No service lets us attach BOTH an owner and skills to a cv in one call,
    // so for cvs we use the repository directly.
    const cvRepository = app.get<Repository<Cv>>(getRepositoryToken(Cv));

    //skills
    const skills: Skill[] = [];
    // We await each create() inside the loop, one after another, so the ids
    // are assigned in order.
    for (const designation of SKILLS) {
        skills.push(await skillService.create({ designation }));
    }

    //users
    const users: User[] = [];

    //after adding the auth part
    // The seeded users must be able to LOG IN, so their password is a bcrypt
    // hash too. All 5 share the same password '123456' (hashed once, outside
    // the loop; the salt is inside the hash so it is still a valid hash).
    const hashedPassword = await bcrypt.hash('123456', 10);
    for (let i=0; i<5; i++) {
        users.push(
            await userService.create({
                // The `${i}` suffix/prefix guarantees uniqueness: username and
                // email are UNIQUE columns and two random values could collide.
                username: `${randUserName()}${i}`,
                email: `${i}${randEmail()}`,
                //password: String(randPassword()),
                // (Old line above: a random clear-text password. Replaced
                // because it could never be used to log in once bcrypt was added.)
                password: hashedPassword,
                //adding the role: just the first user is admin
                role: i === 0 ? 'admin' : 'user',
            }),
        );
    }

    //cvs: each one gets an owenr and 2-4 skills
    for (let i=0; i<15; i++) {
        const cv = cvRepository.create({
            name: randLastName(),
            firstname: randFirstName(),
            age: randNumber({ min: 18, max: 60 }),
            // An 8-digit number turned into a string (the column is varchar(8)).
            cin: String(randNumber({ min: 10000000, max: 99999999 })),
            job: randJobTitle(),
            // `i % users.length` (i modulo 5) cycles 0,1,2,3,4,0,1,... so the
            // 15 cvs are shared round-robin: each user owns exactly 3 cvs.
            // That's why the same userId appears several times in the cv table:
            // it is the one-to-many relation.
            user: users[i % users.length],
            //the fuck???  ->  answer: how 2 to 4 RANDOM skills are picked:
            //  [...skills]            copy the array (don't reorder the original)
            //  .sort(() => Math.random() - 0.5)   shuffle: the comparison returns
            //                          a random positive/negative number, so the
            //                          order becomes random (not a perfectly
            //                          uniform shuffle, fine for fake data)
            //  .slice(0, randNumber({min:2,max:4}))   keep the first 2, 3 or 4.
            skills: [...skills].sort(() => Math.random() - 0.5).slice(0, randNumber({ min: 2, max: 4 })),
        });
        await cvRepository.save(cv);
    }

    console.log('seed done: 8 skills, 5 users, 15 cvs');
    // Close the container (and the database connection) or the script would
    // never terminate.
    await app.close();

}

bootstrap();
