import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

export const profileImageMulterOptions = {
  storage: diskStorage({
    destination: './public/uploads/profile',
    filename: (req, file, callback) => {
      const ext = extname(file.originalname);
      const filename = `${randomUUID()}${ext}`;
      callback(null, filename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    return callback(null, false);
  }

  callback(null, true);
},
};
