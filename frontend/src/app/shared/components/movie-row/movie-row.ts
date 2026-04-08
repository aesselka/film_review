import { Component, input, ElementRef, ViewChild } from '@angular/core';
import { Movie } from '../../../models/movie.model';
import { MovieCard } from '../movie-card/movie-card';

@Component({
  selector: 'app-movie-row',
  imports: [MovieCard],
  templateUrl: './movie-row.html',
  styleUrl: './movie-row.css',
})
export class MovieRow {
  title = input.required<string>();
  movies = input<Movie[]>([]);

  @ViewChild('row') rowRef!: ElementRef<HTMLElement>;

  scrollRight() {
    this.rowRef.nativeElement.scrollBy({ left: 600, behavior: 'smooth' });
  }
}
