import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'kakooma',
    loadComponent: () => import('./games/kakooma/kakooma.component').then((m) => m.KakoomaComponent),
  },
];
