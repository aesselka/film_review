import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MovieRow } from '../../shared/components/movie-row/movie-row';
import { Movie } from '../../models/movie.model';

interface PublicProfile {
  username: string;
  reviews_count: number;
  favorites_count: number;
  reviews: {
    id: number;
    movie_id: number;
    movie_title: string;
    poster_url: string;
    rating: number;
    text: string;
    image_url: string | null;
    created_at: string;
  }[];
  favorites: { id: number; movie: Movie; added_at: string }[];
}

@Component({
  selector: 'app-user-profile',
  imports: [RouterLink, MovieRow],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  profile = signal<PublicProfile | null>(null);
  activeTab = signal<'reviews' | 'favorites'>('reviews');
  favorites = signal<Movie[]>([]);
  notFound = signal(false);

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    if (!username) return;

    this.http.get<PublicProfile>(`http://localhost:8000/api/users/${username}/`).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.favorites.set(p.favorites.map((f) => f.movie));
      },
      error: () => this.notFound.set(true),
    });
  }

  starsRepeat(n: number) {
    return '★'.repeat(n);
  }
}
