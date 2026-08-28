export type JwtTimeSpan =
  | `${number}s`
  | `${number}m`
  | `${number}h`
  | `${number}d`
  | `${number}w`
  | number;

// Helper to create branded string
export function createJwtTimeSpan(value: string): JwtTimeSpan {
  if (!/^\d+[smhdw]$/.test(value)) {
    throw new Error(`Invalid JWT timespan: "${value}"`);
  }
  return value as JwtTimeSpan;
}

// Utility to parse from env
export function parseJwtTimeSpan(
  value: string | undefined,
  fallback: string = '15m',
): JwtTimeSpan {
  return createJwtTimeSpan((value || fallback).trim());
}
