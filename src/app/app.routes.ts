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
  {
    path: 'magic-square',
    loadComponent: () =>
      import('./games/magic-square/magic-square.component').then((m) => m.MagicSquareComponent),
  },
  {
    path: 'four-fours',
    loadComponent: () =>
      import('./games/four-fours/four-fours.component').then((m) => m.FourFoursComponent),
  },
  {
    path: 'puzzle-vault',
    loadComponent: () =>
      import('./puzzle-vault/vault-home/vault-home.component').then((m) => m.VaultHomeComponent),
  },
  {
    path: 'puzzle-vault/:category',
    loadComponent: () =>
      import('./puzzle-vault/category-list/category-list.component').then(
        (m) => m.CategoryListComponent,
      ),
  },
  {
    path: 'puzzle-vault/:category/:id',
    loadComponent: () =>
      import('./puzzle-vault/puzzle-detail/puzzle-detail.component').then(
        (m) => m.PuzzleDetailComponent,
      ),
  },
];
