import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherEntity } from './entities/teacher.entity';
import { CertificateEntity } from 'src/api/product/certificate/entities/certificate.entity';
import { TokenService } from 'src/infrastructure/token/Token';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import { CustomCacheService } from 'src/infrastructure/cashe-service/nest-cashe-service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherEntity, CertificateEntity])],
  controllers: [TeacherController],
  providers: [TeacherService, TokenService, CryptoService, CustomCacheService],
  exports: [TeacherService]
})
export class TeacherModule { }
