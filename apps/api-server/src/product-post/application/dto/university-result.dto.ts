export class UniversityResultDto {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly domain: string,
    public readonly country: string,
  ) {}
}
