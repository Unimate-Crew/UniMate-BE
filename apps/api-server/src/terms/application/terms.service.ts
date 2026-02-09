import { Injectable } from '@nestjs/common';
import { TermsRepository } from '@app/database';
import { TermsResultDto } from './dto/get-terms-result.dto';

@Injectable()
export class TermsService {
  constructor(private readonly termsRepository: TermsRepository) {}

  async getActiveTerms(): Promise<TermsResultDto[]> {
    const terms =
      await this.termsRepository.findActiveTermsOrderByDisplayOrder();

    return terms.map((term) =>
      TermsResultDto.of(
        term.id,
        term.type,
        term.title,
        term.url,
        term.isRequired,
        term.displayOrder,
      ),
    );
  }
}
