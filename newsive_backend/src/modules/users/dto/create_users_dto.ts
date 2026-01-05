export class CreateUserDto {
  username: string;
  password: string;
  passwordConfirm: string;

  nickname: string;
  birthday: string;
  gender: 'male' | 'female' | 'other';
}
