import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movie } from '../../../models/movie.model';
import { MovieCard } from '../movie-card/movie-card';

@Component({
  selector: 'app-movie-row',
  imports: [MovieCard, RouterLink],
  templateUrl: './movie-row.html',
  styleUrl: './movie-row.css',
})
export class MovieRow {
  title = input.required<string>();
  movies = input<Movie[]>([]);
  link = input<string | null>(null);
  queryParams = input<Record<string, string> | null>(null);
}
