import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { AuthService } from '../../core/services/auth.service';
import { MovieRow } from '../../shared/components/movie-row/movie-row';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MovieRow],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private movieService = inject(MovieService);
  auth = inject(AuthService);

  heroMovies = signal<Movie[]>([]);
  trending = signal<Movie[]>([]);
  topRated = signal<Movie[]>([]);
  action = signal<Movie[]>([]);
  drama = signal<Movie[]>([]);

  heroIndex = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.timer = setInterval(() => {
      this.heroIndex.update((i) => (i + 1) % this.heroMovies().length);
    }, 5000);

    this.movieService.getMovies().subscribe({
      next: (res) => {
        if (res.results.length) {
          this.heroMovies.set(res.results.slice(0, 5));
          this.trending.set(res.results.slice(0, 10));
          this.topRated.set([...res.results].sort((a, b) => (b.imdb_rating ?? 0) - (a.imdb_rating ?? 0)).slice(0, 10));
        }
      },
      error: () => {},
    });

    this.movieService.getMovies(undefined, 'action').subscribe({
      next: (res) => { if (res.results.length) this.action.set(res.results); },
      error: () => {},
    });

    this.movieService.getMovies(undefined, 'drama').subscribe({
      next: (res) => { if (res.results.length) this.drama.set(res.results); },
      error: () => {},
    });
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  get currentHero(): Movie {
    return this.heroMovies()[this.heroIndex()];
  }

  prevHero() {
    const len = this.heroMovies().length;
    this.heroIndex.update((i) => (i - 1 + len) % len);
  }

  nextHero() {
    this.heroIndex.update((i) => (i + 1) % this.heroMovies().length);
  }

  setHero(index: number) {
    this.heroIndex.set(index);
  }
  fixImage(url: string): string {
    return url.replace(/_V1_.*\.jpg/, '_V1_.jpg');
  }

  trailerUrl(movie: Movie): string {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`;
  }
}
