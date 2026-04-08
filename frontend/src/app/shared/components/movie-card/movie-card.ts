import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movie } from '../../../models/movie.model';

@Component({
  selector: 'app-movie-card',
  imports: [RouterLink],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css',
})
export class MovieCard {
  movie = input.required<Movie>();
  showTop10 = input(false);

  get ratingClass() {
    const r = this.movie().imdb_rating;
    if (r >= 8) return 'green';
    if (r >= 7) return 'yellow';
    return 'red';
  }
}
