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
  isFavorited = signal(false);
  activeTab = signal<'about' | 'details'>('about');
  showReviewForm = signal(false);
  reviewRating = signal(0);
  reviewText = '';
  reviewError = signal('');
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
          this.favoritesService.getFavorites().subscribe({
            next: (favs) => this.isFavorited.set(favs.some((f) => f.movie.id === id)),
            error: () => {},
          });
        }
      },
      error: () => {},
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
    this.reviewError.set('');
    this.reviewService
      .createReview(movie.id, { rating: this.reviewRating(), text: this.reviewText })
      .subscribe({
        next: (review) => {
          this.reviews.update((r) => [review, ...r]);
          this.showReviewForm.set(false);
          this.reviewRating.set(0);
          this.reviewText = '';
        },
        error: (err) => this.reviewError.set(err.error?.detail ?? 'Failed to submit review'),
      });
  }

  deleteReview(id: number) {
    this.reviewService.deleteReview(id).subscribe({
      next: () => this.reviews.update((r) => r.filter((x) => x.id !== id)),
      error: () => {},
    });
  }

  toggleFavorite() {
    const movie = this.movie();
    if (!movie) return;
    if (this.isFavorited()) {
      this.favoritesService.removeFavorite(movie.id).subscribe({
        next: () => this.isFavorited.set(false),
        error: () => {},
      });
    } else {
      this.favoritesService.addFavorite(movie.id).subscribe({
        next: () => this.isFavorited.set(true),
        error: () => {},
      });
    }
  }

  setRating(star: number) {
    this.reviewRating.set(star);
  }

  starsRepeat(n: number) {
    return '★'.repeat(n);
  }
}
