import { Module } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateEntity } from './entities/certificate.entity';
import { TeacherModule } from 'src/api/user/teacher/teacher.module';

@Module({
  imports: [TypeOrmModule.forFeature([CertificateEntity]), TeacherModule],
  controllers: [CertificateController],
  providers: [CertificateService],
})
export class CertificateModule { }
