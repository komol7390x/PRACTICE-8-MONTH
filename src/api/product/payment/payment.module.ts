import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './entities/payment.entity';
import { LessonTemplateEntity } from '../lesson-template/entities/lesson-template.entity';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, LessonTemplateEntity, StudentEntity])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule { }
