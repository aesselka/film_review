import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';

  private _token = signal<string | null>(localStorage.getItem('access_token'));
  private _username = signal<string | null>(localStorage.getItem('username'));

  isLoggedIn = computed(() => !!this._token());
  username = computed(() => this._username());

  login(username: string, password: string) {
    return this.http
      .post<{ access: string }>(`${this.base}/auth/login/`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('username', username);
          this._token.set(res.access);
          this._username.set(username);
        })
      );
  }

  register(username: string, email: string, password: string) {
    return this.http.post(`${this.base}/auth/register/`, { username, email, password });
  }

  logout() {
    this.http.post(`${this.base}/auth/logout/`, {}).subscribe();
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    this._token.set(null);
    this._username.set(null);
  }

}
