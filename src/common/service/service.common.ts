export class CommonService {
  getNameMultiLanguage (language: string, data: string) {
    if (language == 'VI' || language == null || data == null) {
      return null
    }
    const map = new Map(Object.entries(data))
    return map.get(language)
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
