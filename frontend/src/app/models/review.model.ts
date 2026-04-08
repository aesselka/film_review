export interface Review {
  id: number;
  user: string;
  rating: number;
  text: string;
  created_at: string;
  is_owner: boolean;
}

export interface ReviewPayload {
  rating: number;
  text: string;
}
