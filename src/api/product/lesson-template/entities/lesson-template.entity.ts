import { BaseEntity } from "src/core/base.entity";
import { Column, Entity } from "typeorm";

@Entity('lessonTemplate')
export class LessonTemplateEntity extends BaseEntity {
    @Column({ type: 'int' })
    teacherId: number

    @Column({ type: 'varchar' })
    name: number

    @Column({ type: 'varchar', array: true })
    timeSlots: string[];
}
