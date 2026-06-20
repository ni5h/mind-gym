import { Component, OnDestroy, computed, effect, input, signal } from '@angular/core';

const TICK_MS = 100;

/**
 * Purely cosmetic stopwatch — ticks up while `running` is true, resets when it goes
 * false -> true. Actual scoring uses its own Date.now() capture in the game component;
 * this just gives Neo a sense that time is being measured without countdown pressure.
 */
@Component({
  selector: 'app-timer-display',
  standalone: true,
  template: `<span class="font-mono text-sm text-gray-400">{{ display() }}</span>`,
})
export class TimerDisplayComponent implements OnDestroy {
  running = input(false);

  private readonly elapsedMs = signal(0);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly display = computed(() => `${(this.elapsedMs() / 1000).toFixed(1)}s`);

  constructor() {
    effect(() => {
      if (this.running()) {
        this.elapsedMs.set(0);
        this.intervalId = setInterval(() => this.elapsedMs.update((v) => v + TICK_MS), TICK_MS);
      } else {
        this.clearTimer();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
