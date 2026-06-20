import { Component, input } from '@angular/core';

export type FeedbackState = 'correct' | 'incorrect' | null;

@Component({
  selector: 'app-feedback-toast',
  standalone: true,
  template: `
    @if (state()) {
      <div
        class="absolute inset-0 flex items-center justify-center rounded-xl text-2xl font-bold pointer-events-none"
        [class]="
          state() === 'correct'
            ? 'bg-emerald-50/90 text-emerald-600'
            : 'bg-rose-50/90 text-rose-600'
        "
      >
        {{ state() === 'correct' ? '✓ Nice!' : '✗ Try again' }}
      </div>
    }
  `,
})
export class FeedbackToastComponent {
  state = input<FeedbackState>(null);
}
