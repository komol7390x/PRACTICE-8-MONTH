import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';
import { CreateBotDto } from './dto/create-bot.dto';

@Injectable()
export class BotService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly userRepository: Repository<StudentEntity>,
  ) { }

  async findByPhone(phoneNumber: string) {
    return await this.userRepository.findOne({ where: { phoneNumber } });
  }

  async findByTelegramId(telegramId: string) {
    return await this.userRepository.findOne({ where: { tgId: telegramId } });
  }

  async create(student: CreateBotDto) {
    const newUser = this.userRepository.create({
      firstName: student.firstName,
      lastName: student.lastName,
      tgId: student.tgId,
      tgUsername: student.tgUsername,
      phoneNumber: student.phoneNumber
    });
    return await this.userRepository.save(newUser);
  }
}
