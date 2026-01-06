import { BaseEntity } from "src/core/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { PaymentStatus } from "../enum/payment-status";
import { Roles } from "src/common/enum/roles.enum";
import { StudentEntity } from "src/api/user/student/entities/student.entity";
import { TeacherEntity } from "src/api/user/teacher/entities/teacher.entity";
import { LessonTemplateEntity } from "../../lesson-template/entities/lesson-template.entity";

@Entity('payment')
export class PaymentEntity extends BaseEntity {
    @Column({ type: 'int', nullable: true })
    lessonId: number

    @Column({ type: 'int', nullable: true })
    studentId: number

    @Column({ type: 'int', nullable: true })
    teacherId: number

    @Column({ type: 'decimal' })
    price: number

    @Column({ type: 'enum', enum: Roles, nullable: true })
    role: Roles

    @Column({ type: 'enum', enum: PaymentStatus })
    status: PaymentStatus

    @Column({ type: 'timestamptz', nullable: true })
    canceledAt: Date

    @Column({ type: 'timestamptz', nullable: true })
    performanceAt: Date

    @Column({ type: 'varchar' })
    reason: string

    @ManyToOne(() => StudentEntity, (student) => student.payments,
        { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'studentId' })
    student: StudentEntity

    @ManyToOne(() => TeacherEntity, (student) => student.payments,
        { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'teacherId' })
    teacher: TeacherEntity

    @ManyToOne(() => LessonTemplateEntity, (student) => student.payments,
        { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'lessonId' })
    lesson: LessonTemplateEntity
}
