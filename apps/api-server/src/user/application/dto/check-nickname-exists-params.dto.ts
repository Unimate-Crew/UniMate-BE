export class CheckNicknameExistsParamsDto {
  nickname: string;

  static of(nickname: string): CheckNicknameExistsParamsDto {
    const params = new CheckNicknameExistsParamsDto();
    params.nickname = nickname;
    return params;
  }
}
