import { Module } from '@nestjs/common';
import { StatisticaService } from './statistica.service';
import { StatisticaController } from './statistica.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from '../../user/admin/entities/admin.entity';
import { TeacherEntity } from 'src/api/user/teacher/entities/teacher.entity';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity, TeacherEntity, StudentEntity])],
  controllers: [StatisticaController],
  providers: [StatisticaService],
})
export class StatisticaModule { }
