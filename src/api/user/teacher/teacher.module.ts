import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherEntity } from './entities/teacher.entity';
import { CertificateEntity } from 'src/api/product/certificate/entities/certificate.entity';
import { GoogleEntity } from 'src/api/product/google/entities/google.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherEntity, CertificateEntity, GoogleEntity])],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule { }
