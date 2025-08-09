export class CheckUserExistsResultDto {
  exists: boolean;

  static of(exists: boolean): CheckUserExistsResultDto {
    const result = new CheckUserExistsResultDto();
    result.exists = exists;
    return result;
  }
}
