import { Module } from '@nestjs/common';
import { TeacherPaymentService } from './teacher-payment.service';
import { TeacherPaymentController } from './teacher-payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherPaymentEntity } from './entities/teacher-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherPaymentEntity])],
  controllers: [TeacherPaymentController],
  providers: [TeacherPaymentService],
  exports: [TeacherPaymentService]
})
export class TeacherPaymentModule { }
