export class BaseResponse {
  data: any
  meta: any
  constructor (msg?: string, data?: any, status?: number) {
    this.data = data
    if (!status) {
      status = 200
    }
    this.meta = { message: msg, status: status }
  }
}
