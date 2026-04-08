import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../core/services/movie.service';
import { ReviewService } from '../../core/services/review.service';
import { HistoryService } from '../../core/services/history.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { AuthService } from '../../core/services/auth.service';
import { MovieRow } from '../../shared/components/movie-row/movie-row';
import { Movie, MovieDetail as MovieDetailModel } from '../../models/movie.model';
import { Review } from '../../models/review.model';
import MOCK from '../../data/mock-movies.json';

function toDetail(m: (typeof MOCK)[0]): MovieDetailModel {
  return {
    ...m,
    certificate: '',
    meta_score: 0,
    video_url: '',
    director: 'Unknown',
    stars: [],
    votes: 0,
    gross: '',
    avg_user_rating: m.imdb_rating,
    reviews_count: 0,
  };
}

@Component({
  selector: 'app-movie-detail',
  imports: [FormsModule, MovieRow],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css',
})
export class MovieDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private reviewService = inject(ReviewService);
  private historyService = inject(HistoryService);
  private favoritesService = inject(FavoritesService);
  auth = inject(AuthService);

  movie = signal<MovieDetailModel | null>(null);
  reviews = signal<Review[]>([]);
  similar = signal<Movie[]>([]);
  activeTab = signal<'about' | 'details'>('about');
  showReviewForm = signal(false);
  reviewRating = signal(0);
  reviewText = '';
  hoverStar = signal(0);

  readonly stars = [1, 2, 3, 4, 5];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMovie(id);
  }

  loadMovie(id: number) {
    this.movieService.getMovie(id).subscribe({
      next: (m) => {
        this.movie.set(m);
        if (this.auth.isLoggedIn()) {
          this.historyService.addToHistory(id).subscribe();
        }
      },
      error: () => {
        const found = MOCK.find((m) => m.id === id) ?? MOCK[0];
        this.movie.set(toDetail(found));
        const genres = found.genres;
        this.similar.set(
          MOCK.filter((m) => m.id !== found.id && m.genres.some((g) => genres.includes(g))).slice(0, 8)
        );
      },
    });

    this.reviewService.getReviews(id).subscribe({
      next: (r) => this.reviews.set(r),
      error: () => {},
    });

    this.movieService.getSimilar(id).subscribe({
      next: (s) => this.similar.set(s),
      error: () => {},
    });
  }

  submitReview() {
    const movie = this.movie();
    if (!movie || !this.reviewRating() || !this.reviewText.trim()) return;
    this.reviewService
      .createReview(movie.id, { rating: this.reviewRating(), text: this.reviewText })
      .subscribe({
        next: (review) => {
          this.reviews.update((r) => [review, ...r]);
          this.showReviewForm.set(false);
          this.reviewRating.set(0);
          this.reviewText = '';
        },
        error: () => {},
      });
  }

  deleteReview(id: number) {
    this.reviewService.deleteReview(id).subscribe({
      next: () => this.reviews.update((r) => r.filter((x) => x.id !== id)),
      error: () => {},
    });
  }

  addFavorite() {
    const movie = this.movie();
    if (!movie) return;
    this.favoritesService.addFavorite(movie.id).subscribe();
  }

  setRating(star: number) {
    this.reviewRating.set(star);
  }

  starsRepeat(n: number) {
    return '★'.repeat(n);
  }
}
