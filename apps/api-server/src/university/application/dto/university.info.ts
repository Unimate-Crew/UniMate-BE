import { Country } from '../../../common/enums';

export class UniversityInfo {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly country: Country,
  ) {}
}
