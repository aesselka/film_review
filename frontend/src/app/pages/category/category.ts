import { Component, inject, signal, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { Movie } from '../../models/movie.model';
import { Genre } from '../../models/genre.model';

@Component({
  selector: 'app-category',
  imports: [FormsModule, MovieCard],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category implements OnInit, AfterViewInit {
  private movieService = inject(MovieService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  movies = signal<Movie[]>([]);
  genres = signal<Genre[]>([]);
  selectedGenre = signal('');
  searchQuery = '';

  currentPage = 1;
  hasMore = signal(false);
  loading = signal(false);
  private shouldFocus = false;

  ngOnInit() {
    this.http.get<Genre[]>('http://localhost:8000/api/genres/').subscribe({
      next: (g) => this.genres.set(g),
      error: () => {},
    });

    const genreParam = this.route.snapshot.queryParamMap.get('genre');
    if (genreParam) this.selectedGenre.set(genreParam);

    const focus = this.route.snapshot.queryParamMap.get('focus');
    if (focus === '1') this.shouldFocus = true;

    this.loadMovies();
  }

  ngAfterViewInit() {
    if (this.shouldFocus) {
      setTimeout(() => this.searchInputRef?.nativeElement.focus(), 150);
    }
  }

  loadMovies() {
    this.currentPage = 1;
    this.loading.set(true);
    this.movieService
      .getMovies(this.searchQuery || undefined, this.selectedGenre() || undefined, 1)
      .subscribe({
        next: (res) => {
          this.movies.set(res.results);
          this.hasMore.set(!!res.next);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  loadMore() {
    this.currentPage++;
    this.loading.set(true);
    this.movieService
      .getMovies(this.searchQuery || undefined, this.selectedGenre() || undefined, this.currentPage)
      .subscribe({
        next: (res) => {
          this.movies.update((m) => [...m, ...res.results]);
          this.hasMore.set(!!res.next);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  selectGenre(slug: string) {
    this.selectedGenre.set(this.selectedGenre() === slug ? '' : slug);
    this.loadMovies();
  }

  onSearch() {
    this.loadMovies();
  }
}
