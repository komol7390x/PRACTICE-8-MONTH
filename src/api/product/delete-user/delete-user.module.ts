import { Module } from '@nestjs/common';
import { DeleteUserService } from './delete-user.service';
import { DeleteUserController } from './delete-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteUserEntity } from './entities/delete-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeleteUserEntity])],
  controllers: [DeleteUserController],
  providers: [DeleteUserService],
})
export class DeleteUserModule { }
