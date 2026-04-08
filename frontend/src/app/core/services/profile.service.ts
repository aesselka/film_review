import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';

  getProfile() {
    return this.http.get<User>(`${this.base}/profile/`);
  }
}
