import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { AuthService } from '../../core/services/auth.service';
import { MovieRow } from '../../shared/components/movie-row/movie-row';
import { Movie } from '../../models/movie.model';
import MOCK from '../../data/mock-movies.json';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MovieRow],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private movieService = inject(MovieService);
  auth = inject(AuthService);

  heroMovies = signal<Movie[]>(MOCK.slice(0, 5));
  trending = signal<Movie[]>(MOCK.slice(0, 10));
  topRated = signal<Movie[]>([...MOCK].sort((a, b) => b.imdb_rating - a.imdb_rating).slice(0, 10));
  action = signal<Movie[]>(MOCK.filter((m) => m.genres.includes('Action')));
  drama = signal<Movie[]>(MOCK.filter((m) => m.genres.includes('Drama')));

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
        }
      },
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
}
