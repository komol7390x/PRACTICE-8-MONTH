import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";

@Entity('teacherPayment')
export class TeacherPaymentEntity extends BaseEntity {
    @Column({ type: 'int' })
    teacherId: number

    @Column({ type: 'varchar', array: true })
    lessons: string[]

    @Column({ type: 'int', })
    totalLessonAmount: number

    @Column({ type: 'int' })
    platformComission: number

    @Column({ type: 'int' })
    platformAmount: number

    @Column({ type: 'int' })
    teacherAmount: number

    @Column({ type: 'int' })
    paidBy: number

    @Column({ type: 'timestamptz' })
    paidAt: Date

    @Column({ type: 'boolean', nullable: true })
    isCanceled: boolean

    @Column({ type: 'timestamptz', nullable: true })
    canceledAt: Date

    @Column({ type: 'int', nullable: true })
    cancaledBy: number

    @Column({ type: 'varchar', nullable: true })
    cancaledReason: string

    @Column({ type: 'varchar', nullable: true })
    notes: string
}
