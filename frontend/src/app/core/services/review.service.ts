import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review, ReviewPayload } from '../../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';

  getReviews(movieId: number) {
    return this.http.get<Review[]>(`${this.base}/movies/${movieId}/reviews/`);
  }

  createReview(movieId: number, payload: ReviewPayload) {
    return this.http.post<Review>(`${this.base}/movies/${movieId}/reviews/`, payload);
  }

  updateReview(reviewId: number, payload: ReviewPayload) {
    return this.http.put<Review>(`${this.base}/reviews/${reviewId}/`, payload);
  }

  deleteReview(reviewId: number) {
    return this.http.delete(`${this.base}/reviews/${reviewId}/`);
  }
}
