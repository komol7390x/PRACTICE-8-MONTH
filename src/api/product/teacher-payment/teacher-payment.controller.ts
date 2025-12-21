import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TeacherPaymentService } from './teacher-payment.service';
import { CreateTeacherPaymentDto } from './dto/create-teacher-payment.dto';
import { UpdateTeacherPaymentDto } from './dto/update-teacher-payment.dto';

@Controller('teacher-payment')
export class TeacherPaymentController {
  constructor(private readonly teacherPaymentService: TeacherPaymentService) {}

  @Post()
  create(@Body() createTeacherPaymentDto: CreateTeacherPaymentDto) {
    return this.teacherPaymentService.createTeacherPayment(createTeacherPaymentDto);
  }

  @Get()
  findAll() {
    return this.teacherPaymentService.findAllTeacherPayment();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherPaymentService.findOneTeacherPayment(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherPaymentDto: UpdateTeacherPaymentDto) {
    return this.teacherPaymentService.updateTeacherPayment(+id, updateTeacherPaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherPaymentService.removeTeacherPayment(+id);
  }
}
