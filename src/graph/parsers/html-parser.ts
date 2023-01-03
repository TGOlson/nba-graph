import { CheerioAPI, load } from "cheerio";
import { readFile } from "fs/promises";

export type HtmlParser<T> = {
  inputPath: string,
  parse: (api: CheerioAPI) => T
};

export async function runHtmlParser<T>(p: HtmlParser<T>): Promise<T> {
  console.log('Parsing html from file:', p.inputPath);

  const input = await readFile(p.inputPath, 'utf8');
  const api = load(input);

  return p.parse(api);
}
