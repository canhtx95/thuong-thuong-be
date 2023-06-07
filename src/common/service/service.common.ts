import { ProductEntity } from 'src/product/entity/product.entity'

export class CommonService {
  getNameMultiLanguage (language: string, data: string) {
    if (data) {
      const map = new Map(Object.entries(data))
      return map.get(language)
        ? map.get(language.toUpperCase())
        : 'Chưa đặt tên'
    }
    return 'Chưa đặt tên'
  }

  // handleLanguageGetCategory (language: string, data: ProductEntity[]) {
  //   if (data && data.length > 0) {
  //     data.map(product => {
  //       const metadata = product.metadata
  //       const map = new Map(Object.entries(metadata))
  //       map.get('danhMuc1')
  //       map.get('danhMuc2')
  //       console.log(map)
  //     })
  //   }
  // }
}
