import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";
import { PaymentStatus } from "../enum/transaction-enum";

@Entity('transaction')
export class TransactionEntity extends BaseEntity {
    @Column({ type: 'int' })
    lessonId: number

    @Column({ type: 'int' })
    studentId: number

    @Column({ type: 'decimal' })
    prica: number

    @Column({ type: 'enum', enum: PaymentStatus })
    status: PaymentStatus

    @Column({ type: 'timestamptz', nullable: true })
    canceledAt: Date

    @Column({ type: 'timestamptz', nullable: true })
    performanceAt: Date

    @Column({ type: 'varchar' })
    reason: string
}
