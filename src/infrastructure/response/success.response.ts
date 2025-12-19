import { IResponse } from '../pagination/successResponse';

export const successRes = (data: any, statusCode: number = 200): IResponse => {
  return {
    statusCode,
    status: true,
    message: 'success',
    data,
  };
};
