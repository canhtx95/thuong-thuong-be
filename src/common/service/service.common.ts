import { format } from 'date-fns'

export class CommonService {
  readonly DDMMYY_ssMMHH = 'dd/MM/yyyy'
  getNameMultiLanguage (language: string, data: string) {
    if (data) {
      const map = new Map(Object.entries(data))
      return map.get(language.toUpperCase())
        ? map.get(language.toUpperCase())
        : 'Chưa đặt tên'
    }
    return 'Chưa đặt tên'
  }
  formmatDate (data: string | Date, formmat: string) {
    return format(new Date(data), formmat)
  }
}
