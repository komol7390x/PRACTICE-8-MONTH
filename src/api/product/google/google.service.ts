import { Injectable } from '@nestjs/common';
import { CreateGoogleDto } from './dto/create-google.dto';
import { UpdateGoogleDto } from './dto/update-google.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { GoogleEntity } from './entities/google.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GoogleService extends BaseService<CreateGoogleDto, UpdateGoogleDto, GoogleEntity> {
  constructor(@InjectRepository(GoogleEntity) private readonly googleRepository: Repository<GoogleEntity>) { super(googleRepository) }
  createGoogle(createGoogleDto: CreateGoogleDto) {
    return 'This action adds a new google';
  }

  findAllGoogle() {
    return `This action returns all google`;
  }

  findOneGoogle(id: number) {
    return `This action returns a #${id} google`;
  }

  updateGoogle(id: number, updateGoogleDto: UpdateGoogleDto) {
    return `This action updates a #${id} google`;
  }

  removeGoogle(id: number) {
    return `This action removes a #${id} google`;
  }
}
