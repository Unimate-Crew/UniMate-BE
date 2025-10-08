export class VerificationCodeCache {
  private code: string;

  private email: string;

  private universityId: number;

  constructor(code: string, email: string, universityId: number) {
    this.code = code;
    this.email = email;
    this.universityId = universityId;
  }

  public getCode(): string {
    return this.code;
  }

  public getEmail(): string {
    return this.email;
  }

  public getUniversityId(): number {
    return this.universityId;
  }

  public isCodeMatching(code: string): boolean {
    return this.code === code;
  }

  public serialize(): string {
    return JSON.stringify(this.toJSON());
  }

  public static deserialize(data: string): VerificationCodeCache {
    const parsed = JSON.parse(data);
    return VerificationCodeCache.from(parsed);
  }

  public static from(data: {
    code: string;
    email: string;
    universityId: number;
  }): VerificationCodeCache {
    return new VerificationCodeCache(data.code, data.email, data.universityId);
  }

  public toJSON(): {
    code: string;
    email: string;
    universityId: number;
  } {
    return {
      code: this.code,
      email: this.email,
      universityId: this.universityId,
    };
  }
}
