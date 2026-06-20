import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PuzzleVaultCategory } from '../../core/models';
import { PUZZLE_VAULT_ENTRIES } from '../puzzle-vault-data';
import { PuzzleVaultStoreService } from '../puzzle-vault-store.service';

interface CategoryCard {
  category: PuzzleVaultCategory;
  label: string;
  total: number;
  solved: number;
}

const CATEGORY_LABELS: Record<PuzzleVaultCategory, string> = {
  measuring: 'Measuring & Jugs',
  crossing: 'River Crossing',
  weighing: 'Weighing & Balance',
  matchstick: 'Matchstick Puzzles',
};

@Component({
  selector: 'app-vault-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Puzzle Vault</h1>
      <p class="text-gray-500 mb-6">
        Classic lateral-thinking puzzles, browsed by difficulty — not a drill, just for fun.
      </p>
      <div class="grid grid-cols-2 gap-4">
        @for (card of categoryCards; track card.category) {
          <a
            [routerLink]="['/puzzle-vault', card.category]"
            class="rounded-xl bg-indigo-50 hover:bg-indigo-100 transition p-4 text-center"
          >
            <div class="text-lg font-semibold text-gray-800">{{ card.label }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ card.solved }} / {{ card.total }} solved</div>
          </a>
        }
      </div>
    </div>
  `,
})
export class VaultHomeComponent {
  private readonly store = inject(PuzzleVaultStoreService);

  readonly categoryCards: CategoryCard[] = (
    Object.keys(CATEGORY_LABELS) as PuzzleVaultCategory[]
  ).map((category) => {
    const entries = PUZZLE_VAULT_ENTRIES.filter((e) => e.category === category);
    return {
      category,
      label: CATEGORY_LABELS[category],
      total: entries.length,
      solved: this.store.getProgress(category).solvedIds.length,
    };
  });
}
