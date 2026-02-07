import { DEFAULT_PROFILE_IMAGE_URL } from '../constants/profile.constants';

export function mapUser(user: any) {
  const BASE_URL = process.env.SERVER_URL!;
  console.log("서버 경로",BASE_URL)
  const path = user.profileImgUrl || DEFAULT_PROFILE_IMAGE_URL;
  console.log("기본 이미지 경로",path)

  if (path.startsWith('http')) {
    return { ...user, profileImgUrl: path };
  }

  const profileImgUrl = BASE_URL.endsWith('/')
    ? BASE_URL + path
    : BASE_URL + '/' + path;

    console.log("이미지 경로",profileImgUrl)
  return {
    ...user,
    profileImgUrl,
  };
}
