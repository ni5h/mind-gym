export type NumberPyramidMode = 'forward' | 'reverse';

export interface NumberPyramidPuzzle {
  rows: (number | null)[][];
  mode: NumberPyramidMode;
}
