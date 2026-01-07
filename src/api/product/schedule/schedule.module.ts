import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEntity } from './entities/schedule.entity';
import { TeacherEntity } from 'src/api/user/teacher/entities/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleEntity, TeacherEntity])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleTeacherModule { }
