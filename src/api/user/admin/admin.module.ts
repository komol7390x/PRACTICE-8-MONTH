import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from './entities/admin.entity';
import { TokenService } from 'src/infrastructure/token/Token';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity])],
  controllers: [AdminController],
  providers: [AdminService, CryptoService, TokenService],
  exports: [AdminService]
})
export class AdminModule { }
