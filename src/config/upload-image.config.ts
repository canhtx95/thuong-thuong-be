import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { BadRequestException } from '@nestjs/common'
export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new BadRequestException('Only image files are allowed!'),
      false,
    )
  }
  callback(null, true)
}

export function configStorage (dest: string) {
  const storage = {
    storage: diskStorage({
      destination: `./uploads/${dest}`,
      filename: (req, file, cb) => {
        return cb(null, file.originalname)
      },
    }),
    fileFilter: imageFileFilter,
  }
  return storage
}

export const FileInterceptorProduct = FilesInterceptor(
  'upload',
  20,
  configStorage('product'),
)
export const FileInterceptorArticle = FilesInterceptor(
  'upload',
  20,
  configStorage('article'),
)
export const FileInterceptorOther = FilesInterceptor(
  '',
  20,
  configStorage('other'),
)
