export class CommonService {
  getNameMultiLanguage (language: string, data: string) {
    if (data) {
      const map = new Map(Object.entries(data))
      return map.get(language) ? map.get(language) : 'Chưa đặt tên'
    }
    return 'Chưa đặt tên'
  }
}
