import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerEntity } from './entities/logger.entity';
import { Repository } from 'typeorm';
import { Roles } from 'src/common/enum/roles.enum';
import { RequestMethod, Type } from './enum/type';

@Injectable()
export class LoggerService {
  constructor(@InjectRepository(LoggerEntity)
  private readonly loggerRepo: Repository<LoggerEntity>
  ) { }
  // --------------------- FIND ALL ---------------------
  async findAll(
    role?: Roles,
    method?: string,
    type?: Type,
    search?: string,
    page: number = 1,
    limit: number = 100,
  ) {
    const queryBuilder = this.loggerRepo.createQueryBuilder('logger');

    // 1. Filtrlash (Role, Method, Type)
    if (role) {
      queryBuilder.andWhere('logger.role = :role', { role });
    }
    if (method) {
      queryBuilder.andWhere('logger.method = :method', { method });
    }
    if (type) {
      queryBuilder.andWhere('logger.type = :type', { type });
    }

    // 2. Aqlli qidiruv (Smart Search)
    if (search) {
      // Agar search faqat raqamlardan iborat bo'lsa
      if (/^\d+$/.test(search)) {
        const searchNum = parseInt(search);
        queryBuilder.andWhere(
          '(logger.id = :searchNum OR logger.userId = :searchNum)',
          { searchNum },
        );
      } else {
        // Agar matn bo'lsa, path bo'yicha qidiradi (Katta-kichik harfni farqlamaydi)
        queryBuilder.andWhere('logger.path ILike :searchStr', {
          searchStr: `%${search}%`,
        });
      }
    }

    // 3. Tartiblash va Pagination
    queryBuilder
      .orderBy('logger.createdAt', 'DESC') // Yoki 'logger.id'
      .skip((page - 1) * limit)
      .take(limit);

    // Ma'lumotlar va umumiy sonini qaytarish
    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} logger`;
  }


}
