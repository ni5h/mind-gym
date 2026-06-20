import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PuzzleVaultCategory } from '../../core/models';
import { PUZZLE_VAULT_ENTRIES } from '../puzzle-vault-data';
import { PuzzleVaultStoreService } from '../puzzle-vault-store.service';

const CATEGORY_LABELS: Record<PuzzleVaultCategory, string> = {
  measuring: 'Measuring & Jugs',
  crossing: 'River Crossing',
  weighing: 'Weighing & Balance',
  matchstick: 'Matchstick Puzzles',
};

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-xl mx-auto p-6">
      <a routerLink="/puzzle-vault" class="text-sm text-indigo-500 mb-4 inline-block">&larr; All categories</a>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">{{ categoryLabel }}</h1>
      <div class="flex flex-col gap-2">
        @for (entry of entries; track entry.id) {
          <a
            [routerLink]="['/puzzle-vault', category, entry.id]"
            class="flex items-center justify-between rounded-lg bg-gray-50 hover:bg-gray-100 transition px-4 py-3"
          >
            <span class="text-gray-700">Difficulty {{ entry.difficulty }}</span>
            @if (isSolved(entry.id)) {
              <span class="text-emerald-600 text-sm font-semibold">Solved ✓</span>
            } @else {
              <span class="text-gray-400 text-sm">Not yet solved</span>
            }
          </a>
        }
      </div>
    </div>
  `,
})
export class CategoryListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PuzzleVaultStoreService);

  readonly category = this.route.snapshot.paramMap.get('category') as PuzzleVaultCategory;
  readonly categoryLabel = CATEGORY_LABELS[this.category];
  readonly entries = PUZZLE_VAULT_ENTRIES.filter((e) => e.category === this.category).sort(
    (a, b) => a.difficulty - b.difficulty,
  );

  isSolved(puzzleId: string): boolean {
    return this.store.isSolved(this.category, puzzleId);
  }
}
