import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleEntity } from './entities/google.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GoogleEntity])],
  controllers: [GoogleController],
  providers: [GoogleService],
})
export class GoogleModule { }
