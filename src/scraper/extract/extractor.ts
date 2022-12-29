import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type Extractor<T> = {
  inputPath: string,
  outputDir: string,
  outputFileName: string,
  extract: (str: string) => T
};

export type ExtractOptions = {
  save: boolean
};

export async function runExtractor<T>(e: Extractor<T>, opts?: ExtractOptions): Promise<T> {
  console.log('Extracting from file:', e.inputPath);

  const input = await readFile(e.inputPath, 'utf8');
  const res = e.extract(input);

  if (opts?.save) {
    const filePath = path.resolve(e.outputDir, e.outputFileName);
    console.log('Saving output to:', filePath);

    await mkdir(e.outputDir, { recursive: true });
    await writeFile(filePath, JSON.stringify(res));
  }

  return res;
}
