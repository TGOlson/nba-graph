export function notNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// 2023 -> 2022-23
export const singleYearStr = (year: number) => `${year - 1}-${year.toString().slice(2)}`;

// [2021, 2022, 2023] -> 2021-23
export const multiYearStr = (years: number[]) => {
  if (years.length === 0) throw new Error('Invalid years array');

  const start = years[0] as number;
  if (years.length === 1) return singleYearStr(start);

  const end = years[years.length - 1] as number;

  return `${start - 1}-${end.toString().slice(2)}`;
};
