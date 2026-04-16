import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  auth = inject(AuthService);
  private router = inject(Router);
  dropdownOpen = signal(false);

  toggleDropdown() {
    this.dropdownOpen.update((v) => !v);
  }

  logout() {
    this.auth.logout();
    this.dropdownOpen.set(false);
    this.router.navigate(['/login']);
  }

  closeDropdown() {
    this.dropdownOpen.set(false);
  }

  goToSearch() {
    this.router.navigate(['/category'], { queryParams: { focus: '1' } });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.dropdownOpen.set(false);
    }
  }
}
