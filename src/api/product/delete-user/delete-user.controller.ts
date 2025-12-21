import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeleteUserService } from './delete-user.service';
import { CreateDeleteUserDto } from './dto/create-delete-user.dto';
import { UpdateDeleteUserDto } from './dto/update-delete-user.dto';

@Controller('delete-user')
export class DeleteUserController {
  constructor(private readonly deleteUserService: DeleteUserService) { }

  @Post()
  create(@Body() dto: CreateDeleteUserDto) {
    return this.deleteUserService.createDeleteUser(dto);
  }

  @Get()
  findAll() {
    return this.deleteUserService.findAllDeleteUser();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deleteUserService.findOneDeleteUser(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeleteUserDto) {
    return this.deleteUserService.updateDeleteUser(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteUserService.removeDeleteUser(+id);
  }
}
