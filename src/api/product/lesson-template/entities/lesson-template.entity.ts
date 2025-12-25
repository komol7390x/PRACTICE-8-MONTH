import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";
import { WeekDays } from "../enum/week-day";

@Entity('lessonTemplate')
export class LessonTemplateEntity extends BaseEntity {
    @Column({ type: 'int' })
    teacherId: number

    @Column({ type: 'varchar' })
    name: string

    @Column({ type: 'int', nullable: true })
    startTime: number

    @Column({ type: 'int', nullable: true })
    finishTime: number

    @Column({ type: 'enum', enum: WeekDays, nullable: true })
    weekDay: WeekDays
}
