import { Module } from '@nestjs/common';
import { StatisticaService } from './statistica.service';
import { StatisticaController } from './statistica.controller';

@Module({
  controllers: [StatisticaController],
  providers: [StatisticaService],
})
export class StatisticaModule {}
