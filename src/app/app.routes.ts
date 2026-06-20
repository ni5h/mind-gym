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
  {
    path: 'skip-counting',
    loadComponent: () =>
      import('./games/skip-counting/skip-counting.component').then(
        (m) => m.SkipCountingComponent,
      ),
  },
  {
    path: 'kenken',
    loadComponent: () => import('./games/kenken/kenken.component').then((m) => m.KenKenComponent),
  },
  {
    path: 'number-pyramid',
    loadComponent: () =>
      import('./games/number-pyramid/number-pyramid.component').then(
        (m) => m.NumberPyramidComponent,
      ),
  },
];
