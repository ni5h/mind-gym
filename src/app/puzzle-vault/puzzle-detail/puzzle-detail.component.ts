import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PuzzleVaultCategory } from '../../core/models';
import { PUZZLE_VAULT_ENTRIES } from '../puzzle-vault-data';
import { PuzzleVaultStoreService } from '../puzzle-vault-store.service';

@Component({
  selector: 'app-puzzle-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-xl mx-auto p-6">
      <a [routerLink]="['/puzzle-vault', category]" class="text-sm text-indigo-500 mb-4 inline-block">
        &larr; Back to list
      </a>

      <div class="text-sm text-gray-400 mb-2">Difficulty {{ entry.difficulty }}</div>
      <p class="text-lg text-gray-800 mb-6">{{ entry.prompt }}</p>

      @for (hint of entry.hints.slice(0, hintsShown()); track $index) {
        <div class="rounded-lg bg-amber-50 text-amber-700 px-4 py-3 mb-2 text-sm">
          <span class="font-semibold">Hint {{ $index + 1 }}:</span> {{ hint }}
        </div>
      }

      <div class="flex gap-3 mb-6">
        @if (hintsShown() < entry.hints.length) {
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-amber-100 text-amber-800 font-medium"
            (click)="showNextHint()"
          >
            {{ hintsShown() === 0 ? 'Get a hint' : 'Another hint' }}
          </button>
        }
        @if (!solutionShown()) {
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium"
            (click)="revealSolution()"
          >
            Show solution
          </button>
        }
      </div>

      @if (solutionShown()) {
        <div class="rounded-lg bg-emerald-50 px-4 py-4 mb-4">
          <div class="font-semibold text-emerald-800 mb-1">Solution</div>
          <p class="text-emerald-900 text-sm">{{ entry.solution }}</p>
        </div>
        <div class="rounded-lg bg-gray-50 px-4 py-4">
          <div class="font-semibold text-gray-700 mb-1">Why it works</div>
          <p class="text-gray-600 text-sm">{{ entry.explanation }}</p>
        </div>
      }
    </div>
  `,
})
export class PuzzleDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PuzzleVaultStoreService);

  readonly category = this.route.snapshot.paramMap.get('category') as PuzzleVaultCategory;
  readonly entry = PUZZLE_VAULT_ENTRIES.find(
    (e) => e.id === this.route.snapshot.paramMap.get('id'),
  )!;

  readonly hintsShown = signal(0);
  readonly solutionShown = signal(false);

  showNextHint(): void {
    this.hintsShown.update((n) => Math.min(n + 1, this.entry.hints.length));
  }

  revealSolution(): void {
    this.solutionShown.set(true);
    this.store.markSolved(this.category, this.entry.id, this.entry.difficulty);
  }
}
