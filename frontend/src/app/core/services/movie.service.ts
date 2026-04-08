import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Movie, MovieDetail, PaginatedMovies } from '../../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';

  getMovies(search?: string, genre?: string, page?: number) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (genre) params = params.set('genre', genre);
    if (page) params = params.set('page', page.toString());
    return this.http.get<PaginatedMovies>(`${this.base}/movies/`, { params });
  }

  getMovie(id: number) {
    return this.http.get<MovieDetail>(`${this.base}/movies/${id}/`);
  }

  getSimilar(id: number) {
    return this.http.get<Movie[]>(`${this.base}/movies/${id}/similar/`);
  }

  getRecommendations() {
    return this.http.get<Movie[]>(`${this.base}/recommendations/`);
  }
}
