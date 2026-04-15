import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { HistoryService } from '../../core/services/history.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { MovieRow } from '../../shared/components/movie-row/movie-row';
import { User } from '../../models/user.model';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-profile',
  imports: [MovieRow, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private profileService = inject(ProfileService);
  private favoritesService = inject(FavoritesService);
  private historyService = inject(HistoryService);
  private reviewService = inject(ReviewService);
  auth = inject(AuthService);

  profile = signal<User | null>(null);
  activeTab = signal('watched');

  watched = signal<Movie[]>([]);
  favorites = signal<Movie[]>([]);
  reviews = signal<any[]>([]);

  ngOnInit() {
    this.profileService.getProfile().subscribe({
      next: (p) => this.profile.set(p),
      error: () => {},
    });

    this.historyService.getHistory().subscribe({
      next: (entries) =>
        this.watched.set(
          entries.map((e) => ({
            id: e.movie.id,
            title: e.movie.title,
            poster_url: e.movie.poster_url,
            imdb_rating: e.movie.imdb_rating,
            released_year: 0,
            runtime: '',
            genres: [],
            overview: '',
          }))
        ),
      error: () => {},
    });

    this.favoritesService.getFavorites().subscribe({
      next: (entries) => {
        const movies = entries.map((e) => ({
          id: e.movie.id,
          title: e.movie.title,
          poster_url: e.movie.poster_url,
          imdb_rating: e.movie.imdb_rating,
          released_year: 0,
          runtime: '',
          genres: [],
          overview: '',
        }));
        this.favorites.set(movies);
      },
      error: () => {},
    });

    this.reviewService.getUserReviews().subscribe({
      next: (r) => this.reviews.set(r),
      error: () => {},
    });
  }
}
