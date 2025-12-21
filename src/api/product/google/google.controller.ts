import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GoogleService } from './google.service';
import { CreateGoogleDto } from './dto/create-google.dto';
import { UpdateGoogleDto } from './dto/update-google.dto';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Post()
  create(@Body() createGoogleDto: CreateGoogleDto) {
    return this.googleService.createGoogle(createGoogleDto);
  }

  @Get()
  findAll() {
    return this.googleService.findAllGoogle();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.googleService.findOneGoogle(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGoogleDto: UpdateGoogleDto) {
    return this.googleService.updateGoogle(+id, updateGoogleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.googleService.removeGoogle(+id);
  }
}
