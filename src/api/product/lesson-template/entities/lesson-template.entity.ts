import { BaseEntity } from "src/core/base.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { WeekDays } from "../enum/week-day";
import { TeacherEntity } from "src/api/user/teacher/entities/teacher.entity";
import { StudentEntity } from "src/api/user/student/entities/student.entity";
import { BookedLesson } from "../enum/booked-type";

@Entity('lessonTemplate')
export class LessonTemplateEntity extends BaseEntity {
    @Column({ name: 'teacherId', type: 'int' }) // bazadagi nomi
    teacherId: number;

    @Column({ name: 'studentId', type: 'int', nullable: true })
    studentId: number;

    @Column({ type: 'varchar', nullable: true })
    googleEventId: string;

    @Column({ type: 'varchar', nullable: true })
    meetLink: string;

    @Column({ type: 'varchar', default: BookedLesson.AVAILABLE, nullable: true })
    status: string;

    @Column({ type: 'enum', enum: WeekDays, nullable: true })
    weekDays: WeekDays;

    @Column({ default: false, nullable: true })
    isPaidToTeacher: boolean;

    @Column({ type: 'varchar' })
    lessonName: string;

    @Column({ type: 'timestamptz' })
    startTime: Date;

    @Column({ type: 'decimal', nullable: true, default: 10000 })
    price: number;

    @Column({ type: 'timestamptz' })
    endTime: Date;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.lessons)
    @JoinColumn({ name: 'teacherId' })
    teacher: TeacherEntity;

    @ManyToOne(() => StudentEntity)
    @JoinColumn({ name: 'studentId' })
    student: StudentEntity;
}
