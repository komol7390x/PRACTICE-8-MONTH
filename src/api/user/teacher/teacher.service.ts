import { Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { TeacherEntity } from './entities/teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TeacherService extends BaseService<CreateTeacherDto, UpdateTeacherDto, TeacherEntity> {
  constructor(@InjectRepository(TeacherEntity) private readonly teacherRepository: Repository<TeacherEntity>) {
    super(teacherRepository)
  }
  createTeacher(dto: CreateTeacherDto) {
    return 'This action adds a new teacher';
  }

  findAllTeacher() {
    return `This action returns all teacher`;
  }

  findOneTeacher(id: number) {
    return `This action returns a #${id} teacher`;
  }

  updateTeacher(id: number, dto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  remove(id: number) {
    return `This action removes a #${id} teacher`;
  }
}
