import { Roles } from "src/common/enum/roles.enum";
import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from 'typeorm'

@Entity('admin')
export class AdminEntity extends BaseEntity {
    @Column({ type: 'varchar', unique: true })
    username: string;

    @Column({ type: 'varchar', })
    fullname: string;

    @Column({ type: 'varchar' })
    password: string;

    @Column({ type: 'varchar', nullable: true })
    phoneNumber: string;

    @Column({ type: 'varchar', default: '' })
    avatarUrl: string;

    @Column({ type: 'enum', enum: Roles, default: Roles.ADMIN })
    role: Roles;
}
