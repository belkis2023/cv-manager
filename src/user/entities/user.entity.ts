import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { Cv } from '../../cv/entities/cv.entity';


@Entity()
export class User extends TimestampEntity {

    @Column({ default: 'user' })
    role!: string;

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @OneToMany(() => Cv, (cv) => cv.user)
    cvs!: Cv[];
}
