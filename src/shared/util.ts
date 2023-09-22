export function notNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export const getProp = <T>(prop: string | number, obj: {[key: string | number]: T}): T => {
  if (!obj.hasOwnProperty(prop)) throw new Error(`Access error in 'getProp', invalid prop: ${prop}`);
  
  return obj[prop] as T;
};

export const getIndex = <T>(index: number, arr: T[]): T => {
  if (index < 0 || index > arr.length - 1) throw new Error(`Access error in 'getIndex', invalid index: ${index}`);
  return arr[index] as T;
};

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
