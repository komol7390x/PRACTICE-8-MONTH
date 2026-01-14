import { Roles } from "src/common/enum/roles.enum";
import { Column, Entity } from "typeorm";
import { RequestMethod, Type } from "../enum/type";
import { BaseEntity } from "src/core/base.entity";

@Entity('logger')
export class LoggerEntity extends BaseEntity {

    @Column({ type: 'int', nullable: true })
    userId: number

    @Column({ type: 'enum', enum: Roles, nullable: true })
    role: Roles

    @Column({ type: 'enum', enum: RequestMethod, nullable: true })
    method: RequestMethod

    @Column({ type: 'varchar', nullable: true })
    path: string

    @Column({ type: 'json', nullable: true })
    data: any

    @Column({ type: 'enum', enum: Type, nullable: true })
    type: Type
}
