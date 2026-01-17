import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';
import { CreateBotDto } from './dto/create-bot.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { UpdateBotDto } from './dto/update-bot.dto';
import { LessonTemplateService } from '../lesson-template/lesson-template.service';
import { BookedLesson } from '../lesson-template/enum/booked-type';

@Injectable()
export class BotService extends BaseService<CreateBotDto, UpdateBotDto, StudentEntity> {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly userRepository: Repository<StudentEntity>,
    private readonly lessonTemplateService: LessonTemplateService,
  ) { super(userRepository) }

  async findByPhone(phoneNumber: string) {
    return await this.userRepository.findOne({ where: { phoneNumber } });
  }

  async findByTelegramId(telegramId: string) {
    return await this.userRepository.findOne({ where: { tgId: telegramId } });
  }

  async createUser(student: CreateBotDto) {
    const newUser = this.userRepository.create({
      firstName: student.firstName,
      lastName: student.lastName,
      tgId: student.tgId,
      tgUsername: student.tgUsername,
      phoneNumber: student.phoneNumber
    });
    return await this.userRepository.save(newUser);
  }

  async lessonTemplates(studentId: number) {
    const response = await this.lessonTemplateService.findAllBookLesson({
      studentId,
      status: BookedLesson.BOOKED,
      active: true
    });
    return response.data;
  }
}
