export class CommonService {
  getNameMultiLanguage (language: string, data: string) {
    if (data) {
      const map = new Map(Object.entries(data))
      return map.get(language) ? map.get(language) : ''
    }
    return ''
  }
  getContentExtensions (language: string, data: any[]) {
    try {
      for (const obj of data) {
        const map = new Map(Object.entries(obj))
        if (map.get('language') == language) {
          return {
            content: obj.content,
            description: obj.description,
            name: obj.name,
          }
        }
      }
      return {
        content: '',
        description: '',
        name: '',
      }
    } catch (error) {}
    return null
  }
}
