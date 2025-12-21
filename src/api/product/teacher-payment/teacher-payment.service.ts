import { Injectable } from '@nestjs/common';
import { CreateTeacherPaymentDto } from './dto/create-teacher-payment.dto';
import { UpdateTeacherPaymentDto } from './dto/update-teacher-payment.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { TeacherPaymentEntity } from './entities/teacher-payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TeacherPaymentService extends BaseService<CreateTeacherPaymentDto, UpdateTeacherPaymentDto, TeacherPaymentEntity> {
  constructor(@InjectRepository(TeacherPaymentEntity) private readonly teacherPaymentRepo: Repository<TeacherPaymentEntity>) { super(teacherPaymentRepo) }
  createTeacherPayment(createTeacherPaymentDto: CreateTeacherPaymentDto) {
    return 'This action adds a new teacherPayment';
  }

  findAllTeacherPayment() {
    return `This action returns all teacherPayment`;
  }

  findOneTeacherPayment(id: number) {
    return `This action returns a #${id} teacherPayment`;
  }

  updateTeacherPayment(id: number, updateTeacherPaymentDto: UpdateTeacherPaymentDto) {
    return `This action updates a #${id} teacherPayment`;
  }

  removeTeacherPayment(id: number) {
    return `This action removes a #${id} teacherPayment`;
  }
}
