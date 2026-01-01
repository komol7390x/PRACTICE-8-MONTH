import { Module } from '@nestjs/common';
import { StatisticaService } from './statistica.service';
import { StatisticaController } from './statistica.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from '../../user/admin/entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity])],
  controllers: [StatisticaController],
  providers: [StatisticaService],
})
export class StatisticaModule { }
