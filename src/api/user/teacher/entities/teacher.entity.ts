import { CertificateEntity } from "src/api/product/certificate/entities/certificate.entity";
import { Roles } from "src/common/enum/roles.enum";
import { BaseEntity } from "src/core/base.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity('teacher')
export class TeacherEntity extends BaseEntity {
    @Column({ type: 'varchar', unique: true })
    email: string

    @Column({ type: 'varchar', unique: true, nullable: true })
    phoneNumber?: string

    @Column({ type: 'varchar', nullable: true })
    fullname: string

    @Column({ type: 'varchar', nullable: true })
    googleId?: string

    @Column({ type: 'varchar', nullable: true })
    googleRefreshToken: string | null

    @Column({ type: 'varchar', nullable: true })
    googleAccessToken: string | null

    @Column({ type: 'varchar', nullable: true })
    password?: string

    @Column({ type: 'varchar', nullable: true })
    portfolioLink: string

    @Column({ type: 'varchar', nullable: true })
    cardNumber: string

    @Column({ type: 'enum', enum: Roles, default: Roles.TEACHER })
    role: Roles

    @Column({ type: 'varchar', nullable: true })
    imageUrl: string

    @Column({ type: 'int', nullable: true, default: 0 })
    rating: number

    @Column({ type: 'smallint', default: 1, nullable: true })
    expirence: number

    @OneToMany(() => CertificateEntity, (certificate) => certificate.teacher)
    certificates: CertificateEntity[];
}
