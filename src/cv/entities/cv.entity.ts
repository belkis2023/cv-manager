// =====================================================================
// cv.entity.ts - the "Cv" table (the center of the schema in the slide)
// =====================================================================
//   Cv --- * / * --- Skill   : many-to-many  (a Cv has many skills, a skill is on many Cvs)
//   Cv --- * / 1 --- User    : many-to-one   (many Cvs belong to ONE user)

import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { Skill } from '../../skill/entities/skill.entity';
import { User } from '../../user/entities/user.entity';


@Entity()
export class Cv extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    firstname!: string;

    @Column()
    age!: number;

    // Tunisian CIN (national id card) = 8 digits. `length: 8` limits the
    // varchar to 8 characters. It is a string (not a number) so a leading 0
    // is not lost.
    @Column({ length: 8 })
    cin!: string;

    @Column()
    job!: string;

    // `nullable: true` -> the column may be empty (NULL). `?` in TypeScript
    // says the same thing at code level. A cv doesn't have to have a path.
    @Column({ nullable: true })
    path?: string;

    // MANY-TO-MANY with Skill.
    // A many-to-many can't be stored in one column, so TypeORM creates a
    // THIRD table (here "cv_skills_skill") with two columns: cvId, skillId.
    @ManyToMany(() => Skill, (skill) => skill.cvs)
    // Answer to "what's this": @JoinTable() says "this side OWNS the relation
    // and is responsible for creating the join table". It must be put on ONE
    // side only (here Cv); Skill side has no @JoinTable.
    @JoinTable() //what's this
    skills!: Skill[];


    //what's cascade  ->  answer: `onDelete: 'CASCADE'` is a DATABASE rule on
    // the foreign key: if the User row is really DELETED, the database also
    // deletes all the Cvs pointing to it (instead of refusing, or leaving
    // orphans). Careful: our app uses SOFT delete (only sets deletedAt), so
    // the row is never really deleted and this rule doesn't fire from the API.
    // It matters only for a hard DELETE done directly in SQL.
    //
    // MANY-TO-ONE with User: many Cvs -> one User. The foreign key (column
    // "userId", created automatically from the property name `user`) lives
    // HERE, on the "many" side, which is why several cvs show the same userId.
    //  - (user) => user.cvs : the matching property on the User side.
    //  - nullable: true     : a Cv can have no owner.
    // (On the `auth` branch an explicit `userId` column is added next to this
    // relation so that ownership can be checked easily.)
    @ManyToOne(() => User, (user) => user.cvs, { nullable: true, onDelete: 'CASCADE'})
    user!: User;


}
