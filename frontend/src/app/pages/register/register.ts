import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  submit() {
    if (!this.username || !this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.username, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        const data = err.error ?? {};
        const values = Object.values(data) as string[][];
        const msg = data?.detail ?? values?.[0]?.[0] ?? 'Registration failed';
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }
}
