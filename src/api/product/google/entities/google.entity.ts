import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";

@Entity('googleInfo')
export class GoogleEntity extends BaseEntity {
    @Column({ type: 'varchar' })
    googleId: string

    @Column({ type: 'varchar' })
    googleRefreshToken: string

    @Column({ type: 'varchar' })
    googleAccessToken: string
}
