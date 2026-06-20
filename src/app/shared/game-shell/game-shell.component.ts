import { Component, input } from '@angular/core';
import { TimerDisplayComponent } from '../timer-display/timer-display.component';
import { FeedbackState, FeedbackToastComponent } from '../feedback-toast/feedback-toast.component';

/**
 * Shared chrome for every drill game: title, timer, tier/streak indicator, and a
 * feedback overlay. Game-specific puzzle UI is projected via <ng-content>.
 */
@Component({
  selector: 'app-game-shell',
  standalone: true,
  imports: [TimerDisplayComponent, FeedbackToastComponent],
  template: `
    <div class="max-w-xl mx-auto p-6">
      <header class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-gray-800">{{ gameTitle() }}</h1>
        <app-timer-display [running]="running()" />
      </header>

      <div class="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <span>Tier {{ tier() }} / {{ totalTiers() }}</span>
        <span>Streak: {{ streak() }}</span>
      </div>

      <div class="relative">
        <ng-content />
        <app-feedback-toast [state]="feedback()" />
      </div>
    </div>
  `,
})
export class GameShellComponent {
  gameTitle = input.required<string>();
  tier = input.required<number>();
  totalTiers = input.required<number>();
  streak = input(0);
  running = input(false);
  feedback = input<FeedbackState>(null);
}
