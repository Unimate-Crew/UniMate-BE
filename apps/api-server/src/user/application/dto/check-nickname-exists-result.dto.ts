export class CheckNicknameExistsResultDto {
  exists: boolean;

  static of(exists: boolean): CheckNicknameExistsResultDto {
    const result = new CheckNicknameExistsResultDto();
    result.exists = exists;
    return result;
  }
}
