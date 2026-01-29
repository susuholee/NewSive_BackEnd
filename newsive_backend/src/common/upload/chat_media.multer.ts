import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

export const chatMediaMulterOptions = {
  storage: diskStorage({
    destination: './public/uploads/chat',
    filename: (_, file, callback) => {
      const ext = extname(file.originalname);
      callback(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (_, file, callback) => {
    if (
      !file.mimetype.startsWith('image/') &&
      !file.mimetype.startsWith('video/')
    ) {
      return callback(
        new BadRequestException('이미지 또는 영상 파일만 업로드 가능합니다.'),
        false,
      );
    }
    callback(null, true);
  },
};
