import { PartialType } from '@nestjs/swagger';
import { CreateDeleteUserDto } from './create-delete-user.dto';

export class UpdateDeleteUserDto extends PartialType(CreateDeleteUserDto) {}
