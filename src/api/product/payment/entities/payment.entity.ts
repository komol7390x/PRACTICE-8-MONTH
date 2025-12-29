import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";
import { PaymentStatus } from "../enum/payment-status";
import { Roles } from "src/common/enum/roles.enum";

@Entity('payment')
export class PaymentEntity extends BaseEntity {
    @Column({ type: 'int' })
    lessonId: number

    @Column({ type: 'int' })
    studentId: number

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
}
