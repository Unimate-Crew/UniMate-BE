export class UserAgreementResultDto {
  termsId!: number;

  type!: string;

  title!: string;

  url?: string;

  agreedAt!: Date;

  private constructor(
    termsId: number,
    type: string,
    title: string,
    url: string | undefined,
    agreedAt: Date,
  ) {
    this.termsId = termsId;
    this.type = type;
    this.title = title;
    this.url = url;
    this.agreedAt = agreedAt;
  }

  public static of(
    termsId: number,
    type: string,
    title: string,
    url: string | undefined,
    agreedAt: Date,
  ): UserAgreementResultDto {
    return new UserAgreementResultDto(termsId, type, title, url, agreedAt);
  }
}
