import { Country } from '../../../common/enums';

export class UniversityResultDto {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly country: Country,
  ) {}
}
