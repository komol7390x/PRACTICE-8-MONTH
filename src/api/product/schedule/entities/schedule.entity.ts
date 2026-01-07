import { BaseEntity } from "src/core/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { WeekDays } from "../../lesson-template/enum/week-day";
import { TeacherEntity } from "src/api/user/teacher/entities/teacher.entity";

@Entity('schedules')
export class ScheduleEntity extends BaseEntity {

    @Column({ name: 'teacherId', type: 'int' })
    teacherId: number;

    @Column({ type: 'enum', enum: WeekDays, nullable: true })
    weekDays: WeekDays;

    @Column({ type: 'varchar' })
    lessonName: string;

    @Column({ type: 'timestamptz' })
    startTime: Date;

    @Column({ type: 'decimal', nullable: true, default: 10000 })
    price: number;

    @Column({ type: 'timestamptz' })
    endTime: Date;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.lessons,
        { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'teacherId' })
    teacher: TeacherEntity;
}
