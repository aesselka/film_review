export interface Movie {
  id: number;
  title: string;
  released_year: number;
  runtime: string;
  genres: string[];
  imdb_rating: number;
  poster_url: string;
  overview: string;
}

export interface MovieDetail extends Movie {
  certificate: string;
  meta_score: number;
  video_url: string;
  director: string;
  stars: string[];
  votes: number;
  gross: string;
  avg_user_rating: number;
  reviews_count: number;
}

export interface PaginatedMovies {
  count: number;
  next: string | null;
  results: Movie[];
}
