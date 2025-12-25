import { Roles } from "src/common/enum/roles.enum";
import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";

@Entity('student')
export class StudentEntity extends BaseEntity {
    @Column({ type: 'varchar', unique: true })
    phoneNumber: string

    @Column({ type: 'varchar', unique: true })
    tgId: string

    @Column({ type: 'varchar' })
    lastName: string

    @Column({ type: 'varchar' })
    firstName: string

    @Column({ type: 'decimal', nullable: true, default: 0 })
    wallet: number

    @Column({ type: 'enum', enum: Roles, default: Roles.STUDENT })
    role: Roles

    @Column({ type: 'varchar', unique: true })
    tgUsername: string

    @Column({ type: 'timestamptz', nullable: true, })
    blockedAt: Date

    @Column({ type: 'varchar', nullable: true })
    blockedReason: string
}
