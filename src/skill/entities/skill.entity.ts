import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { TimestampEntity } from '../../common/entities/timestamp.entity'
import { Cv } from '../../cv/entities/cv.entity'


@Entity()
export class Skill extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    designation!: string;
 
    //didn't understand this line
    @ManyToMany(() => Cv, (cv) => cv.skills)
    cvs!: Cv[];
}
