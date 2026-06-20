export type KenKenOperation = '+' | '-' | '×' | '÷';

export interface KenKenCage {
  cells: [number, number][];
  operation: KenKenOperation;
  target: number;
}

export interface KenKenPuzzle {
  gridSize: number;
  cages: KenKenCage[];
}
