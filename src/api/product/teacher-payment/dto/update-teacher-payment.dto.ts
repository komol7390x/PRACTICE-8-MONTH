import { PartialType } from '@nestjs/swagger';
import { CreateTeacherPaymentDto } from './create-teacher-payment.dto';

export class UpdateTeacherPaymentDto extends PartialType(CreateTeacherPaymentDto) {}
