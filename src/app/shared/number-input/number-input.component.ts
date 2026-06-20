import { Component, input, output } from '@angular/core';

/**
 * A single numeric blank. Plain input/output (not model()) since callers typically
 * bind it against one slot of an array signal, e.g. [value]="answers()[i]" — an
 * expression model() can't write back to directly.
 */
@Component({
  selector: 'app-number-input',
  standalone: true,
  template: `
    <input
      type="number"
      inputmode="numeric"
      class="w-16 text-center text-xl font-bold py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-400 focus:outline-none disabled:opacity-50"
      [value]="value() ?? ''"
      [disabled]="disabled()"
      (input)="onInput($event)"
    />
  `,
})
export class NumberInputComponent {
  value = input<number | null>(null);
  disabled = input(false);
  valueChange = output<number | null>();

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.valueChange.emit(raw === '' ? null : Number(raw));
  }
}
