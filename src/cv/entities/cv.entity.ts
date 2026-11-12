// =====================================================================
// cv.entity.ts - the "Cv" table (the center of the schema in the slide)
// =====================================================================
//   Cv --- * / * --- Skill   : many-to-many  (a Cv has many skills, a skill is on many Cvs)
//   Cv --- * / 1 --- User    : many-to-one   (many Cvs belong to ONE user)

import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
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


    // Answer to "what's cascade": `onDelete: 'CASCADE'` is a DATABASE rule on
    // the foreign key: if the User row is really DELETED, the database also
    // deletes all the Cvs pointing to it (instead of refusing, or leaving
    // orphans). Careful: our app uses SOFT delete (only sets deletedAt), so
    // the row is never really deleted and this rule doesn't fire from the API.
    // It matters only for a hard DELETE done directly in SQL.

    // OLD VERSION (kept by the author, commented out): the same relation
    // WITHOUT the explicit userId column. It worked, but then we can only
    // reach the owner's id through cv.user.id, which requires loading the
    // relation. Replaced by the version below.
/*     @ManyToOne(() => User, (user) => user.cvs, { nullable: true, onDelete: 'CASCADE'})
    user!: User;  */

    //we're changing as we're doing this part: route protection and cv ownvership
    //we want to expose the owner id on the cv entity

    // NEW: an explicit column `userId` holding the owner's id as a plain
    // number. This lets the service compare `cv.userId !== user.userId`
    // (ownership check) and filter `where: { userId }` without joining the
    // user table. It is the SAME column as the foreign key below (same name
    // 'userId'), not a second one: the table still has only one userId column.
    // nullable: a cv may exist with no owner (e.g. old data).
    @Column({ nullable: true })
    userId?: number;


    // MANY-TO-ONE with User: many Cvs -> one User. The foreign key lives HERE
    // (on the "many" side), that's why several cvs show the same userId.
    //  - (user) => user.cvs : the matching property on the User side.
    //  - nullable: true     : a Cv can have no owner.
    //  - onDelete: 'CASCADE': see the explanation above.
    // @JoinColumn({ name: 'userId' }) says "the foreign key column is the one
    // called userId", which links this relation to the @Column above.
    @ManyToOne(() => User, (user) => user.cvs, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;


}
