import * as cheerio from 'cheerio';

import { LEAGUES_URL, localPath } from "../util/bref-url";
import { Season } from "../../shared/nba-types";
import { HtmlParser } from "./html-parser";

const SELECTOR = 'tr th a[href]';
const URL_REGEX = /([A-Z]{3})_(\d{4}).html/;

export const parse = ($: cheerio.CheerioAPI): Season[] => {
  return $(SELECTOR).toArray().map((el: cheerio.Element) => {
    const url = el.attribs.href;

    if (!url) {
      throw new Error('Invalid response from leagues: unparseable url');
    }

    const res = URL_REGEX.exec(url);

    if (!res?.[1] || !res[2]) {
      throw new Error('Invalid response from leagues: unparseable url');
    }

    const [_, leagueId, year] = res;

    return {
      id: `${leagueId}_${year}`,
      leagueId,
      year: parseInt(year),
      url,
    };
  });
};

export const seasonParser: HtmlParser<Season[]> = {
  inputPath: localPath(LEAGUES_URL).filePath,
  // outputDir: path.resolve(__dirname, '../data/extracted'),
  // outputFileName: 'seasons.json',
  parse,
};
