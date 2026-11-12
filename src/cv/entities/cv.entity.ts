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
