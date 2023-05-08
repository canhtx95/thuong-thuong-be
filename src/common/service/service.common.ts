export class CommonService {
    getNameMultiLanguage(language: string, data: string) {
        console.log(language)
        console.log(data)
        if (language == 'VI' || language == null || data == null) {
            return null
        }
        const map = new Map(Object.entries(data));
        return map.get(language)
    }

    getContentMultiLanguage(language: string, data: any[]) {
        console.log(data)
        for (const obj of data) {
            const map = new Map(Object.entries(obj));
            if (map.get('language') == language) {
                return [obj]
            }
        }
        return null
    }

    uploadImages(){
        
    }
}