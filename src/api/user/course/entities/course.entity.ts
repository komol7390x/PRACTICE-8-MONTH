import { Roles } from "src/common/enum/roles.enum";
import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";

@Entity('course')
export class CourseEntity extends BaseEntity {

    @Column({ type: 'decimal', default: 0 })
    wallet: number

    @Column({ type: 'enum', enum: Roles, default: Roles.SUPER_ADMIN })
    role: Roles

    @Column({ type: 'varchar', default: 'Online course wallet', nullable: true })
    name: string
}

