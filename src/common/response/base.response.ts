export class BaseResponse {
  statusCode: number;
  message: string;
  data: any;

  constructor(msg?: string, data?: any, statusCode?: number) {
    this.message = msg;
    this.data = data;
    this.statusCode = statusCode;
    if (!statusCode) {
      this.statusCode = 200;
    }
  }
}
