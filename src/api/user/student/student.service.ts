import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { StudentEntity } from './entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StudentService extends BaseService<CreateStudentDto, UpdateStudentDto, StudentEntity> {
  constructor(@InjectRepository(StudentEntity) private readonly studentRepository: Repository<StudentEntity>)
  { super(studentRepository) }

  createStudent(dto: CreateStudentDto) {
    return 'This action adds a new student';
  }

  findAllStudent() {
    return `This action returns all student`;
  }

  findOneStudent(id: number) {
    return `This action returns a #${id} student`;
  }

  updateStudent(id: number, dto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  removeStudent(id: number) {
    return `This action removes a #${id} student`;
  }
}
