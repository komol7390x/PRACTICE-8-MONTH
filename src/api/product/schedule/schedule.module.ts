import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEntity } from './entities/schedule.entity';
import { TeacherEntity } from 'src/api/user/teacher/entities/teacher.entity';
import { AuthService } from 'src/api/user/auth/auth.service';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';
import { LessonTemplateEntity } from '../lesson-template/entities/lesson-template.entity';
import { AuthModule } from 'src/api/user/auth/auth.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleEntity,
      TeacherEntity,
    ]),
    AuthModule,   
    PaymentModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleTeacherModule { }
