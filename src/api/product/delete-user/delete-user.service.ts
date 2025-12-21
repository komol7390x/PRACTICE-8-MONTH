import { Injectable } from '@nestjs/common';
import { CreateDeleteUserDto } from './dto/create-delete-user.dto';
import { UpdateDeleteUserDto } from './dto/update-delete-user.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { DeleteUserEntity } from './entities/delete-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DeleteUserService extends BaseService<CreateDeleteUserDto, UpdateDeleteUserDto, DeleteUserEntity> {
  constructor(@InjectRepository(DeleteUserEntity) private readonly deleteUserRepo: Repository<DeleteUserEntity>) { super(deleteUserRepo) }
  createDeleteUser(dto: CreateDeleteUserDto) {
    return 'This action adds a new deleteUser';
  }

  findAllDeleteUser() {
    return `This action returns all deleteUser`;
  }

  findOneDeleteUser(id: number) {
    return `This action returns a #${id} deleteUser`;
  }

  updateDeleteUser(id: number, dto: UpdateDeleteUserDto) {
    return `This action updates a #${id} deleteUser`;
  }

  removeDeleteUser(id: number) {
    return `This action removes a #${id} deleteUser`;
  }
}
