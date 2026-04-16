export interface Review {
  id: number;
  user: string;
  rating: number;
  text: string;
  image_url: string | null;
  created_at: string;
  is_owner: boolean;
}

export interface ReviewPayload {
  rating: number;
  text: string;
  image?: File | null;
}
