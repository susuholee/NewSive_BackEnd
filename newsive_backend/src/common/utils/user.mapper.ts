import { DEFAULT_PROFILE_IMAGE_URL } from '../constants/profile.constants';

export function mapUser(user: any) {
  const BASE_URL = process.env.SERVER_URL!;
  const path = user.profileImgUrl || DEFAULT_PROFILE_IMAGE_URL;

  if (path.startsWith('http')) {
    return { ...user, profileImgUrl: path };
  }

  const profileImgUrl = BASE_URL.endsWith('/')
    ? BASE_URL + path
    : BASE_URL + '/' + path;

  return {
    ...user,
    profileImgUrl,
  };
}
