export class VerifyUniversityEmailResultDto {
  constructor(
    public readonly universityId: number,
    public readonly universityEmail: string,
  ) {}
}
