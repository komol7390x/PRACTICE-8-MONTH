import { Roles } from "src/common/enum/roles.enum";
import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";

@Entity('teacher')
export class TeacherEntity extends BaseEntity {
    @Column({ type: 'varchar', unique: true })
    email: string

    @Column({ type: 'varchar', unique: true })
    phoneNumber: string

    @Column({ type: 'varchar', nullable: true })
    fullName: string

    @Column({ type: 'varchar' })
    password: string

    @Column({ type: 'varchar', nullable: true })
    cardNumber: string

    @Column({ type: 'enum', enum: Roles, default: Roles.TEACHER })
    role: Roles

    @Column({ type: 'varchar', nullable: true })
    imageUrl: string

    @Column({ type: 'int', nullable: true, default: 0 })
    rating: number
}
