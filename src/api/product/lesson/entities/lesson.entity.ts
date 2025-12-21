import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";
import { LessonStatus } from "../enum/lesson";

@Entity('lesson')
export class LessonEntity extends BaseEntity {
    @Column({ type: 'varchar', })
    name: string

    @Column({ type: 'timestamptz', })
    startTime: Date

    @Column({ type: 'timestamptz', })
    endTime: Date

    @Column({ type: 'int' })
    teacherId: number

    @Column({ type: 'int' })
    studentId: number

    @Column({ type: 'enum', enum: LessonStatus })
    status: LessonStatus

    @Column({ type: 'varchar', })
    googleEventId: string

    @Column({ type: 'decimal' })
    price: number

    @Column({ type: 'boolean', nullable: true, default: false })
    isPaid: number

    @Column({ type: 'int', nullable: true })
    teacherPaymentId: number

    @Column({ type: 'timestamptz', nullable: true })
    bookedAt: Date

    @Column({ type: 'timestamptz', nullable: true })
    remainedSendAt: Date

    @Column({ type: 'timestamptz', nullable: true })
    complatedAt: Date

}
