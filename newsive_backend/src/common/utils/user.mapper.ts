import { DEFAULT_PROFILE_IMAGE_URL } from '../constants/profile.constants';

export function mapUser(user: any) {
  const BASE_URL = process.env.SERVER_URL!;
  const DEFAULT_PATH = DEFAULT_PROFILE_IMAGE_URL;

  const profilePath = user.profileImgUrl || DEFAULT_PATH;
  const normalizedPath = profilePath.replace(/^\/+/, '');
  const profileImgUrl = `${BASE_URL}/${normalizedPath}`;

  return {
    ...user,
    profileImgUrl,  
  };
}
