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
    if (payload.image) {
      const form = new FormData();
      form.append('rating', payload.rating.toString());
      form.append('text', payload.text);
      form.append('image', payload.image);
      return this.http.post<Review>(`${this.base}/movies/${movieId}/reviews/`, form);
    }
    return this.http.post<Review>(`${this.base}/movies/${movieId}/reviews/`, {
      rating: payload.rating,
      text: payload.text,
    });
  }

  updateReview(reviewId: number, payload: ReviewPayload) {
    return this.http.put<Review>(`${this.base}/reviews/${reviewId}/`, payload);
  }

  deleteReview(reviewId: number) {
    return this.http.delete(`${this.base}/reviews/${reviewId}/`);
  }

  getUserReviews() {
    return this.http.get<any[]>(`${this.base}/user-reviews/`);
  }
}
