import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from './entities/transaction.entity'
import { BaseService } from 'src/infrastructure/base/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService extends BaseService<CreateTransactionDto, UpdateTransactionDto, TransactionEntity> {
  constructor(@InjectRepository(TransactionEntity) private readonly transactionRepo: Repository<TransactionEntity>) { super(transactionRepo) }
  createTransaction(dto: CreateTransactionDto) {
    return 'This action adds a new transaction';
  }

  findAllTransaction() {
    return `This action returns all transaction`;
  }

  findOneTransaction(id: number) {
    return `This action returns a #${id} transaction`;
  }

  updateTransaction(id: number, dto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  removeTransaction(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
