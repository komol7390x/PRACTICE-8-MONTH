import { BaseEntity } from "src/core/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { LanguageLevel } from "../enum/lang-level";
import { TeacherEntity } from "src/api/user/teacher/entities/teacher.entity";

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

    @Column({ type: 'int', nullable: true })
    teacherId: number;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.certificates, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'teacherId' })
    teacher: TeacherEntity;
}
