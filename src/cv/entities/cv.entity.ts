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

    @Column({ nullable: true })
    path?: string;

    @ManyToMany(() => Skill, (skill) => skill.cvs)
    @JoinTable() //what's this
    skills!: Skill[];


    //what's cascade
/*     @ManyToOne(() => User, (user) => user.cvs, { nullable: true, onDelete: 'CASCADE'})
    user!: User;  */   

    //we're changing as we're doing this part: route protection and cv ownvership
    //we want to expose the owner id on the cv entity
    @Column({ nullable: true })
    userId?: number;


    @ManyToOne(() => User, (user) => user.cvs, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;


}
