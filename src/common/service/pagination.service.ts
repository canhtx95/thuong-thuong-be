import { Exclude } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class Pagination {
  @IsNumber()
  page: number = 1
  @IsNumber()
  size: number = 20
   totalRecords: number
   skip: number
   totalPages: number
  constructor (page: number, size: number) {
    this.skip = (page - 1) * size
    this.size = size
  }
  createResult (totalRecords: number) {
    this.totalRecords = totalRecords
    this.totalPages = Math.ceil(totalRecords / this.size); // số trang
    delete this.skip
  }
}
