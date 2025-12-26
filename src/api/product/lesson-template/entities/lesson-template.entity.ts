import { BaseEntity } from "src/core/base.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { WeekDays } from "../enum/week-day";
import { TeacherEntity } from "src/api/user/teacher/entities/teacher.entity";
import { StudentEntity } from "src/api/user/student/entities/student.entity";

@Entity('lessonTemplate')
export class LessonTemplateEntity extends BaseEntity {
    @Column({ name: 'teacherId', type: 'int' }) // bazadagi nomi
    teacherId: number; // klass ichidagi nomi

    @Column({ name: 'studentId', type: 'int', nullable: true })
    studentId: number;

    @Column({ type: 'varchar', nullable: true })
    googleEventId: string;

    @Column({ type: 'varchar', nullable: true })
    meetLink: string;

    @Column({ type: 'varchar', default: 'available' })
    status: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'timestamptz' })
    startTime: Date;

    @Column({ type: 'timestamptz' })
    endTime: Date;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.lessons)
    @JoinColumn({ name: 'teacherId' }) // teacher_id column bilan bog'lanadi
    teacher: TeacherEntity;

    @ManyToOne(() => StudentEntity)
    @JoinColumn({ name: 'studentId' })
    student: StudentEntity;
}