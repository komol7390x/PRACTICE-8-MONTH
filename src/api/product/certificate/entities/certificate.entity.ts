import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";
import { LanguageLevel } from "../enum/lang-level";

@Entity('specification')
export class CertificateEntity extends BaseEntity {
    @Column({ type: 'varchar', unique: true })
    specificationName: string

    @Column({ type: 'enum', enum: LanguageLevel, })
    level: LanguageLevel

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ type: 'int' })
    hourPrice: number

    @Column({ type: 'varchar', nullable: true })
    portfolioLink: string
}
