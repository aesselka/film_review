import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'category',
    loadComponent: () => import('./pages/category/category').then((m) => m.Category),
  },
  {
    path: 'movies/:id',
    loadComponent: () => import('./pages/movie-detail/movie-detail').then((m) => m.MovieDetail),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'users/:username',
    loadComponent: () => import('./pages/user-profile/user-profile').then((m) => m.UserProfile),
  },
  { path: '**', redirectTo: '' },
];
