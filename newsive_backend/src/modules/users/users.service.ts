import {BadRequestException, ConflictException,Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateNotificationSettingDto } from './dto/update_notification_setting.dto';
import { DEFAULT_PROFILE_IMAGE_URL } from 'src/common/constants/profile.constants';
import { mapUser } from 'src/common/utils/user.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async checkUsername(username: string) {
  const user = await this.prisma.user.findUnique({
    where: { username },
  });

  if (user) {
    throw new ConflictException('이미 사용 중인 아이디입니다');
  }

  return { available: true };
  }

  async findMyInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        setting: true,
      },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const setting = await this.ensureUserSetting(userId);

    const BASE_URL = process.env.SERVER_URL!; 
    const DEFAULT_PATH = process.env.DEFAULT_PROFILE_IMAGE_URL!; 

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      birthday: user.birthday,
      gender: user.gender,
      profileImgUrl: user.profileImgUrl ? `${BASE_URL}/${user.profileImgUrl}`: `${BASE_URL}/${DEFAULT_PATH}`,
      allowNotification: setting.allowNotification,
    };
  }


  async changeNickname(userId: number, nickname : string) {
    const user = await this.prisma.user.findUnique({
      where : {id :  userId},
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const updateUser = await this.prisma.user.update({
      where : { id : userId},
      data : { nickname }
    });

    return {
      message : '닉네임이 변경되었습니다',
      nickname : updateUser.nickname,
    };
  }

  async changePassword(userId : number, currentPassword : string, newPassword : string) {
    const user = await this.prisma.user.findUnique({
      where : {id : userId},
    });

   if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('현재 패스워드가 일치하지 않습니다');
    }

    const hashedPwd = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where : {id : userId},
      data : {password : hashedPwd},
    });

    return {
      message : '비밀번호가 변경되었습니다.'
    }
  }

  async deleteUser(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('유저를 찾을 수 없습니다.');
  }

  await this.prisma.$transaction([
    this.prisma.userSetting.deleteMany({
      where: { userId },
    }),


    this.prisma.notification.deleteMany({
      where: { userId },
    }),

    this.prisma.friend.deleteMany({
      where: {
        OR: [
          { userId },
          { friendUserId: userId },
        ],
      },
    }),

    this.prisma.user.delete({
      where: { id: userId },
    }),
  ]);

  return {
    message: '회원탈퇴가 완료되었습니다.',
  };
  }

  async ensureUserSetting(userId: number) {
    const setting = await this.prisma.userSetting.findUnique({
      where : { userId},
    });

    if (setting) return setting;

    return this.prisma.userSetting.create({
      data: {userId},
    });
  }

  async getNotificationSetting(userId: number) {

    const user = await this.prisma.user.findUnique({
      where : { id : userId},
      select : { id : true},
    });

    if(!user){
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }

    const setting = await this.ensureUserSetting(userId);

    return {
      allowNotification : setting.allowNotification,
      allowBreakingNews : setting.allowBreakingNews,
      allowKeywordAlert : setting.allowKeywordAlert,
      defaultRegion : setting.defaultRegion
    };
  }

  async updateNotificationSetting(userId: number, dto : UpdateNotificationSettingDto){
    const user = await this.prisma.user.findUnique({
      where : {id: userId},
      select :  {id: true},
    });

    if(!user){
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    await this.ensureUserSetting(userId);

     return this.prisma.userSetting.update({
    where: { userId },
    data: {
      ...(dto.allowNotification !== undefined && {
        allowNotification: dto.allowNotification,
      }),
      ...(dto.allowBreakingNews !== undefined && {
        allowBreakingNews: dto.allowBreakingNews,
      }),
      ...(dto.allowKeywordAlert !== undefined && {
        allowKeywordAlert: dto.allowKeywordAlert,
      }),
      ...(dto.defaultRegion !== undefined && {
        defaultRegion: dto.defaultRegion,
      }),
    },
  });
  }


  async updateProfileImage(userId: number, profileImgPath: string | null) {
  if (!profileImgPath) {
    throw new BadRequestException('업로드할 프로필 이미지를 선택해주세요.');
  }

  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, profileImgUrl: true, username: true, nickname: true },
  });

  if (!user) {
    throw new NotFoundException('유저를 찾을 수 없습니다.');
  }

  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: { profileImgUrl: profileImgPath },
    select: {
      id: true,
      username: true,
      nickname: true,
      profileImgUrl: true,
    },
  });

  return {
    message: '프로필 이미지가 변경되었습니다.',
    user: mapUser(updatedUser),   
  };
  }


}
