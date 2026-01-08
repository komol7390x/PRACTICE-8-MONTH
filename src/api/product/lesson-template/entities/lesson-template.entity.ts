import { BaseEntity } from "src/core/base.entity";
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { WeekDays } from "../enum/week-day";
import { TeacherEntity } from "src/api/user/teacher/entities/teacher.entity";
import { StudentEntity } from "src/api/user/student/entities/student.entity";
import { BookedLesson } from "../enum/booked-type";
import { PaymentEntity } from "../../payment/entities/payment.entity";

@Entity('lessonTemplate')
export class LessonTemplateEntity extends BaseEntity {
    @Column({ name: 'teacherId', type: 'int' })
    teacherId: number;

    @Column({ name: 'studentId', type: 'int', nullable: true })
    studentId: number;

    @Column({ type: 'varchar', nullable: true })
    googleEventId: string;

    @Column({ type: 'varchar', nullable: true })
    meetLink: string;

    @Column({ type: 'varchar', default: BookedLesson.PENDING, nullable: true })
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

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.lessons,
        { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'teacherId' })
    teacher: TeacherEntity;

    @ManyToOne(() => StudentEntity, (student) => student.lessons,
        { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'studentId' })
    student: StudentEntity;
}
