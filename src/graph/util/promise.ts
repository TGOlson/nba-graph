type ExecFn<T> = () => Promise<T>;

export async function execSeq<T> (fns: ExecFn<T>[]): Promise<T[]> {
  const arr: T[] = [];

  const promiseExecution = async (): Promise<void> => {
    for (const fn of fns) {
      const res = await fn();
      arr.push(res);
    }
  };

  await promiseExecution();
  return arr;
}
