export type FourFoursOperator = '+' | '-' | '×' | '÷';
export type FourFoursToken = number | FourFoursOperator | '(' | ')';

export interface FourFoursPuzzle {
  digits: number[];
  target: number;
}
