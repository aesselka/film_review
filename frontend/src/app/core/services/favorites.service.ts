import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FavoriteEntry } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';

  getFavorites() {
    return this.http.get<FavoriteEntry[]>(`${this.base}/favorites/`);
  }

  addFavorite(movieId: number) {
    return this.http.post(`${this.base}/favorites/`, { movie_id: movieId });
  }

  removeFavorite(movieId: number) {
    return this.http.delete(`${this.base}/favorites/${movieId}/`);
  }
}
