import { Controller,Post,UploadedFile,UseInterceptors,BadRequestException} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { chatMediaMulterOptions } from '../../common/upload/chat_media.multer';
import { Multer } from "multer";

@Controller()
export class UploadController {
  @Post('media')
  @UseInterceptors(FileInterceptor('file', chatMediaMulterOptions))
  uploadChatMedia(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }

    const type = file.mimetype.startsWith('image/')
      ? 'IMAGE'
      : 'VIDEO';

    return {
      url: `${process.env.SERVER_URL}/uploads/chat/${file.filename}`,
      type,
    };
  }
}
