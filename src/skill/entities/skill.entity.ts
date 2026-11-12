// =====================================================================
// skill.entity.ts - the "Skill" table
// =====================================================================
// An ENTITY is a class that TypeORM maps to a database table:
//   class = table, property = column, decorator = column settings.

import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { TimestampEntity } from '../../common/entities/timestamp.entity'
import { Cv } from '../../cv/entities/cv.entity'
// NB: imports are RELATIVE ('../../...'), never 'src/...'. The slides insist
// on this: the seed script runs through ts-node outside Nest's build, and
// absolute paths would not resolve there.


// @Entity() marks the class as a table (named "skill").
// `extends TimestampEntity` inherits createdAt / updatedAt / deletedAt.
@Entity()
export class Skill extends TimestampEntity {
    // Auto-incremented primary key (1, 2, 3...).
    @PrimaryGeneratedColumn()
    id!: number;

    // A normal text column (varchar). The slide spells it "Desigantion"
    // (typo); we use the correct spelling "designation".
    @Column()
    designation!: string;

    // Answer to "didn't understand this line":
    // This is the OTHER SIDE of the Cv <-> Skill many-to-many relation.
    //   - A Cv has many Skills, and a Skill belongs to many Cvs (the "* *" in
    //     the slide's diagram).
    //   - `() => Cv` : the related entity. It's an arrow function (lazy) because
    //     Cv imports Skill and Skill imports Cv (circular import); the arrow
    //     delays reading `Cv` until both files are loaded.
    //   - `(cv) => cv.skills` : "on the Cv side, the matching property is
    //     called `skills`". This tells TypeORM the two properties describe the
    //     SAME relation.
    // This side has NO @JoinTable: the join table (cv_skills_skill) is declared
    // on the Cv side only (the "owning side"). Here `cvs` is just a convenient
    // way to navigate from a skill to its cvs; it creates no column.
    @ManyToMany(() => Cv, (cv) => cv.skills)
    cvs!: Cv[];
}
