import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionService.createTransaction(dto);
  }

  @Get()
  findAll() {
    return this.transactionService.findAllTransaction();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOneTransaction(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionService.updateTransaction(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.removeTransaction(+id);
  }
}
