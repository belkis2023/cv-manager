// =====================================================================
// user.entity.ts - the "User" table  (master branch: before authentication)
// =====================================================================
// Slide 1 schema: User has id, username, email, password.
// (The `role` column required by slide 10 is added later, on the `auth` branch.)

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { Cv } from '../../cv/entities/cv.entity';


// NB: "user" is a reserved word in PostgreSQL, so in raw SQL you must write
// "user" with double quotes (e.g. SELECT * FROM "user"). TypeORM quotes it
// automatically, so the code is not affected.
@Entity()
export class User extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    // `unique: true` creates a UNIQUE constraint in the database: two users
    // can never share a username (or an email).
    @Column({ unique: true })
    username!: string;

    @Column({ unique: true })
    email!: string;

    // On master the password is stored exactly as received (clear text): the
    // hashing with bcrypt is introduced on the `auth` branch.
    @Column()
    password!: string;

    // ONE user has MANY cvs. This is the "1" side of the "1 --- *" link in the
    // slide's diagram. It creates NO column in the user table: the foreign key
    // lives on the Cv side (column userId in the cv table). `(cv) => cv.user`
    // says "the matching property on Cv is called `user`".
    @OneToMany(() => Cv, (cv) => cv.user)
    cvs!: Cv[];
}
