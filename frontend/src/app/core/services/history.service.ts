import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HistoryEntry } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';

  getHistory() {
    return this.http.get<HistoryEntry[]>(`${this.base}/history/`);
  }

  addToHistory(movieId: number) {
    return this.http.post(`${this.base}/history/`, { movie_id: movieId });
  }
}
