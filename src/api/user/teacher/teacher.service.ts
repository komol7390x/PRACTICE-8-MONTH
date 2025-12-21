import { Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { TeacherEntity } from './entities/teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherSort, TeacherStatus } from './enum/teacher-enum';

@Injectable()
export class TeacherService extends BaseService<CreateTeacherDto, UpdateTeacherDto, TeacherEntity> {
  constructor(@InjectRepository(TeacherEntity) private readonly teacherRepository: Repository<TeacherEntity>) {
    super(teacherRepository)
  }
  async createTeacher(dto: CreateTeacherDto) {
    return 'This action adds a new teacher';
  }

  async findAllTeacher(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: TeacherStatus,
    sort?: TeacherSort,
    level?: string,
    lang?: string
  ) {
    const skip = (page - 1) * limit;
    const s = await this.teacherRepository.find({
      relations: { certificates: true, googles: true },
      select: {
        certificates: true, googles: true
      }
    })
    console.log(s);

    return s
  }

  async findOneTeacher(id: number) {
    return `This action returns a #${id} teacher`;
  }

  async updateTeacher(id: number, dto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  async remove(id: number) {
    return `This action removes a #${id} teacher`;
  }
}
