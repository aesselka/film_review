export interface User {
  id: number;
  username: string;
  email: string;
  watched_count: number;
  reviews_count: number;
  favorites_count: number;
}

export interface HistoryEntry {
  id: number;
  movie: {
    id: number;
    title: string;
    poster_url: string;
    imdb_rating: number;
  };
  watched_at: string;
}

export interface FavoriteEntry {
  id: number;
  movie: {
    id: number;
    title: string;
    poster_url: string;
    imdb_rating: number;
  };
  added_at: string;
}
