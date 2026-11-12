// =====================================================================
// user.entity.ts - the "User" table
// =====================================================================
// Slide 10 asks for: username (unique), password, email (unique), role.

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { Cv } from '../../cv/entities/cv.entity';


// NB: "user" is a reserved word in PostgreSQL, so in raw SQL you must write
// "user" with double quotes (e.g. SELECT * FROM "user"). TypeORM quotes it
// automatically, so the code is not affected.
@Entity()
export class User extends TimestampEntity {

    // The user's role: 'user' by default, 'admin' for administrators.
    // It is a plain string and NOT an enum on purpose: slide 13 says the app
    // owner can add roles at any time. With an enum, each new role would need
    // a code change and a database migration; with a string, a new role is
    // just a new value. (The AdminGuard accepts ONLY the exact value 'admin',
    // so a brand-new role gets no special rights by accident.)
    // `default: 'user'` -> everyone who registers is a normal user; nobody can
    // become admin through the API (RegisterDto has no `role` field).
    @Column({ default: 'user' })
    role!: string;

    @PrimaryGeneratedColumn()
    id!: number;

    // `unique: true` creates a UNIQUE constraint in the database: two users
    // can never share a username (or an email). That's the "(unique)" of the slide.
    @Column({ unique: true })
    username!: string;

    @Column({ unique: true })
    email!: string;

    // Stores the bcrypt HASH of the password, never the clear text
    // (register and the seed hash it before saving).
    @Column()
    password!: string;

    // ONE user has MANY cvs. This is the "1" side of the "1 --- *" link in the
    // slide's diagram. It creates NO column in the user table: the foreign key
    // lives on the Cv side (column userId in the cv table). `(cv) => cv.user`
    // says "the matching property on Cv is called `user`".
    @OneToMany(() => Cv, (cv) => cv.user)
    cvs!: Cv[];
}
