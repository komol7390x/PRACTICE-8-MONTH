import { Injectable, OnModuleInit } from '@nestjs/common';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { Repository } from 'typeorm';
import { BaseService } from 'src/infrastructure/base/base.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Roles } from 'src/common/enum/roles.enum';

@Injectable()
export class CourseService extends BaseService<CreateCourseDto, UpdateCourseDto, CourseEntity> implements OnModuleInit {
  constructor(@InjectRepository(CourseEntity) private readonly courseRepo: Repository<CourseEntity>) { super(courseRepo) }

  async onModuleInit() {
    const roles = await this.courseRepo.findOne({
      where: { role: Roles.SUPER_ADMIN },
    });
    if (!roles) {
      await this.courseRepo.save(this.courseRepo.create({
        role: Roles.SUPER_ADMIN,
        wallet: 0
      }));
      console.log('Course created');
    }
  }
  async findAllCourse() {
    return await this.courseRepo.find()
  }

}
