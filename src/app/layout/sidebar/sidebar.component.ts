import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const MATH_GAMES: NavItem[] = [
  { name: 'Kakooma', path: '/kakooma', icon: '🔢' },
  { name: 'Skip Counting', path: '/skip-counting', icon: '⏭️' },
  { name: 'KenKen', path: '/kenken', icon: '🧮' },
  { name: 'Number Pyramid', path: '/number-pyramid', icon: '🔺' },
  { name: 'Magic Square', path: '/magic-square', icon: '🟪' },
  { name: 'Four 4s', path: '/four-fours', icon: '4️⃣' },
];

/**
 * Persistent app-shell navigation. Math is the only live subject; Languages and
 * Science are visual placeholders only (no routes yet) so the IA reads correctly
 * for where this is headed without building anything for them now.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-56 h-screen flex flex-col bg-white border-r border-gray-200 overflow-y-auto p-4">
      <a routerLink="/" class="text-xl font-bold text-gray-800 mb-6 block">🧠 Mind Gym</a>

      <div class="mb-6">
        <h2 class="text-xs font-semibold uppercase text-gray-400 mb-2 px-2">Math</h2>
        <nav class="flex flex-col gap-1">
          @for (game of mathGames; track game.path) {
            <a
              [routerLink]="game.path"
              routerLinkActive="bg-indigo-100 text-indigo-700 font-semibold"
              class="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-indigo-50 transition"
            >
              {{ game.icon }} {{ game.name }}
            </a>
          }
        </nav>
      </div>

      <div class="mb-6 opacity-50">
        <h2 class="text-xs font-semibold uppercase text-gray-400 mb-2 px-2">Languages</h2>
        <span class="block rounded-lg px-3 py-2 text-sm text-gray-400">🔤 Coming soon</span>
      </div>

      <div class="mb-6 opacity-50">
        <h2 class="text-xs font-semibold uppercase text-gray-400 mb-2 px-2">Science</h2>
        <span class="block rounded-lg px-3 py-2 text-sm text-gray-400">🔬 Coming soon</span>
      </div>

      <div class="mt-auto pt-4 border-t border-gray-200">
        <a
          routerLink="/puzzle-vault"
          routerLinkActive="bg-amber-100 text-amber-700 font-semibold"
          class="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-amber-50 transition block"
        >
          🗝️ Puzzle Vault
        </a>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly mathGames = MATH_GAMES;
}
