export class TermsResultDto {
  id!: number;

  type!: string;

  title!: string;

  url?: string;

  isRequired!: boolean;

  displayOrder!: number;

  private constructor(
    id: number,
    type: string,
    title: string,
    url: string | undefined,
    isRequired: boolean,
    displayOrder: number,
  ) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.url = url;
    this.isRequired = isRequired;
    this.displayOrder = displayOrder;
  }

  public static of(
    id: number,
    type: string,
    title: string,
    url: string | undefined,
    isRequired: boolean,
    displayOrder: number,
  ): TermsResultDto {
    return new TermsResultDto(id, type, title, url, isRequired, displayOrder);
  }
}
