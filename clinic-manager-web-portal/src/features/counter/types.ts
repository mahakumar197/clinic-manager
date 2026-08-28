/**
 * Counter feature types
 */

export interface CounterState {
  value: number;
  loading: boolean;
  error: string | null;
}
