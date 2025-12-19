import { IResponse } from '../pagination/successResponse';

export const successRes = (data: any, statusCode: number = 200): IResponse => {
  return {
    statusCode,
    message: {
      uz: 'Amaliyot muvaffaqiyatli bajarildi',
      en: 'Operation successfully completed',
      ru: 'Операция успешно выполнена',
    },
    data,
  };
};
