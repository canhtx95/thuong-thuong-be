import { ProductEntity } from 'src/product/entity/product.entity'

export class CommonService {
  getNameMultiLanguage (language: string, data: string) {
    if (data) {
      const map = new Map(Object.entries(data))
      return map.get(language.toUpperCase())
        ? map.get(language.toUpperCase())
        : 'Chưa đặt tên'
    }
    return 'Chưa đặt tên'
  }
}
