import { HttpException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  IFindOptions,
  IResponsePagination,
  IResponse,
} from '../pagination/successResponse';
import { RepositoryPager } from '../pagination/RepositoryPager';
import { successRes } from '../response/success.response';

export class BaseService<CreateDto, UpdateDto, Entity> {
  constructor(private readonly repository: Repository<any>) { }

  get getRepository() {
    return this.repository;
  }
  // ---------------- CREATE ----------------

  async create(dto: CreateDto): Promise<IResponse> {
    let data = this.repository.create({
      ...dto,
    }) as any as Entity;
    data = await this.repository.save(data);
    return successRes(data, 201);
  }
  // ---------------- FIND ALL ----------------

  async findAll(options?: IFindOptions<Entity>): Promise<IResponse> {
    const data = (await this.repository.find({
      ...options,
    })) as Entity[];
    return successRes(data);
  }
  // ---------------- FIND PAGANATION----------------

  async findAllWithPagination(
    options?: IFindOptions<Entity>,
  ): Promise<IResponsePagination> {
    return await RepositoryPager.findAll(
      this.getRepository, options);
  }
  // ---------------- FIND ONE BY ----------------

  async findOneBy(options: IFindOptions<Entity>): Promise<IResponse> {
    const data = (await this.repository.findOne({
      select: options.select || {},
      relations: options.relations || [],
      where: options.where,
    })) as Entity;
    if (!data) {
      throw new NotFoundException();
    }
    return successRes(data);
  }
  // ---------------- FIND ONE ----------------

  async findOneById(
    id: string | number,
    options?: IFindOptions<Entity>,
  ): Promise<IResponse> {
    const data = (await this.repository.findOne({
      select: options?.select || {},
      relations: options?.relations || [],
      where: { id, ...options?.where },
    })) as unknown as Entity;
    if (!data) {
      throw new NotFoundException(`${id} not found`);
    }
    return successRes(data);
  }
  // ---------------- UPDATE DELETE ----------------

  async update(id: string | number, dto: UpdateDto): Promise<IResponse> {
    await this.findOneById(id);
    await this.repository.update(id, dto as any);
    const data = await this.repository.findOne({ where: { id } });
    return successRes(data);
  }
  // ---------------- HARD DELETE ----------------

  async delete(id: string | number): Promise<IResponse> {
    await this.findOneById(id);

    (await this.repository.delete(id)) as unknown as Entity;
    return successRes({});
  }
  // ---------------- SOFT DELETE ----------------

  async softDelete(id: string | number, status: boolean = false): Promise<IResponse> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    if (status !== undefined) {
      user.isDeleted = status;
      user.isActive = !status;
    }

    const data = await this.repository.save(user);
    return successRes({ isDelete: data?.isDeleted });
  }
  // ---------------- UPDATE STATUS ----------------
  async updateStatus(id: string | number, active: boolean): Promise<IResponse> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    user.isActive = active;
    const data = await this.repository.save(user);
    return successRes({ isActive: data?.isActive });
  }

}
