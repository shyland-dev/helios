import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@helios';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  // Rotas públicas (guest guard: redireciona para dashboard se já logado)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  // Rotas protegidas (auth guard: redireciona para login se não logado)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'plants',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/plants/plants').then((m) => m.Plants),
  },
  {
    path: 'plants/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/plants/plant-detail/plant-detail').then((m) => m.PlantDetail),
  },
  {
    path: 'devices',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/devices/devices').then((m) => m.Devices),
  },
  {
    path: 'devices/:sn',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/devices/device-detail/device-detail').then((m) => m.DeviceDetail),
  },
  { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
];
