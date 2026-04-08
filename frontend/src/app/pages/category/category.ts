import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
export class Category implements OnInit {
  private movieService = inject(MovieService);
  private http = inject(HttpClient);

  movies = signal<Movie[]>([]);
  genres = signal<Genre[]>([]);
  selectedGenre = signal('');
  searchQuery = '';

  ngOnInit() {
    this.http.get<Genre[]>('http://localhost:8000/api/genres/').subscribe({
      next: (g) => this.genres.set(g),
      error: () => {},
    });
    this.loadMovies();
  }

  loadMovies() {
    this.movieService
      .getMovies(this.searchQuery || undefined, this.selectedGenre() || undefined)
      .subscribe({
        next: (res) => this.movies.set(res.results),
        error: () => {},
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
