import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";

@Entity('deleteUsers')
export class DeleteUserEntity extends BaseEntity {
    @Column({ type: 'int' })
    deleteUserId: number

    @Column({ type: 'int' })
    deletedBy: number

    @Column({ type: 'timestamptz', nullable: true })
    deletedAt: Date

    @Column({ type: 'timestamptz', nullable: true })
    restoreAt: Date

}
