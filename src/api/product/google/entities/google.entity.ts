import { TeacherEntity } from "src/api/user/teacher/entities/teacher.entity";
import { BaseEntity } from "src/core/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity('googleInfo')
export class GoogleEntity extends BaseEntity {
    @Column({ type: 'varchar' })
    googleId: string

    @Column({ type: 'varchar' })
    googleRefreshToken: string

    @Column({ type: 'varchar' })
    googleAccessToken: string

    @Column({ type: 'int'})
    teacherId: number;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.googles, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'teacherId' })
    teacher: TeacherEntity;
}
