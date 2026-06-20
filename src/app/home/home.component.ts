import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface GameLink {
  name: string;
  path: string | null;
}

const GAMES: GameLink[] = [
  { name: 'Kakooma', path: '/kakooma' },
  { name: 'Skip Counting', path: '/skip-counting' },
  { name: 'KenKen', path: '/kenken' },
  { name: 'Number Pyramid', path: '/number-pyramid' },
  { name: 'Magic Square', path: '/magic-square' },
  { name: 'Four 4s', path: '/four-fours' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Mind Gym</h1>
      <div class="grid grid-cols-2 gap-4">
        @for (game of games; track game.name) {
          @if (game.path) {
            <a
              [routerLink]="game.path"
              class="text-lg font-semibold py-6 text-center rounded-xl bg-indigo-50 hover:bg-indigo-100 transition"
            >
              {{ game.name }}
            </a>
          } @else {
            <span
              class="text-lg font-semibold py-6 text-center rounded-xl bg-gray-50 text-gray-400"
            >
              {{ game.name }}<br /><span class="text-xs">coming soon</span>
            </span>
          }
        }
      </div>

      <h2 class="text-lg font-bold text-gray-800 mt-8 mb-3">Puzzle Vault</h2>
      <a
        routerLink="/puzzle-vault"
        class="block text-center py-6 rounded-xl bg-amber-50 hover:bg-amber-100 transition font-semibold text-gray-700"
      >
        Browse classic lateral-thinking puzzles
      </a>
    </div>
  `,
})
export class HomeComponent {
  readonly games = GAMES;
}
