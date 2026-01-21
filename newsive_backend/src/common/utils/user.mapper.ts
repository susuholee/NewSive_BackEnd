import { DEFAULT_PROFILE_IMAGE_URL } from '../constants/profile.constants';

export function mapUser(user: any) {
  return {
    ...user,
    profileImgUrl:
      user.profileImgUrl ?? DEFAULT_PROFILE_IMAGE_URL,
  };
}
