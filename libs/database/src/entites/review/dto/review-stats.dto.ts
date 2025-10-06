export class ReviewStatsDto {
  averageRating: number | null;

  totalReviews: number;

  constructor(averageRating: number | null, totalReviews: number) {
    this.averageRating = averageRating;
    this.totalReviews = totalReviews;
  }

  static of(
    averageRating: number | null,
    totalReviews: number,
  ): ReviewStatsDto {
    return new ReviewStatsDto(averageRating, totalReviews);
  }
}
