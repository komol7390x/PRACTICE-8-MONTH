import { IResponsePagination } from './successResponse';

export class Pager<T> {
  public static of<T>(
    statusCode: number,
    message: string,
    status: boolean,
    data: Array<T>,
    totalElements: number,
    pageSize: number,
    currentPage: number,
  ): IResponsePagination {
    const from = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalElements);

    return new Pager(
      statusCode,
      message,
      status,
      data,
      totalElements,
      Math.ceil(totalElements / pageSize),
      pageSize,
      currentPage,
      from,
      to,
    ).toPage();
  }

  private constructor(
    private statusCode: number,
    private message: string,
    private status: boolean,
    private data: Array<T>,
    private totalElements: number,
    private totalPages: number,
    private pageSize: number,
    private currentPage: number,
    private from: number,
    private to: number,
  ) { }

  public toPage(): IResponsePagination {
    return {
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      status: this.status,
      totalElements: this.totalElements,
      totalPages: this.totalPages,
      pageSize: this.pageSize,
      currentPage: this.currentPage,
      from: this.from,
      to: this.to,
    };
  }
}
