import * as cheerio from 'cheerio';

import { localPath, playerIndexUrl } from "../util/bref-url";
import { PartialPlayer } from "../../shared/nba-types";
import { HtmlParser } from "./html-parser";

const SELECTOR = 'table#players tbody tr';
const URL_REGEX = /players\/[a-z]{1}\/([a-z]{2,}\d{2}).html/;

const parse = ($: cheerio.CheerioAPI): PartialPlayer[] => {
  return $(SELECTOR).toArray().map((el: cheerio.AnyNode) => {
    const url = $('th[data-stat="player"] a', el).attr('href');
    const name = $('th[data-stat="player"] a[href]', el).text();
    const yearMax = $('td[data-stat="year_max"]', el).text();

    if (!url) {
      throw new Error('Invalid response from player: no url');
    }
    
    const res = URL_REGEX.exec(url);
        
    if (!res?.[1] || res.length === 1) {
      throw new Error(`Invalid response from team: unparseable url. ${url}`);
    } 
    
    const [_, playerId] = res;

    return {
      id: playerId,
      name,
      url,
      yearMax: parseInt(yearMax)
    };
  });
};

export const makePlayerParser = (firstLetterLastName: string): HtmlParser<PartialPlayer[]> => ({
  inputPath: localPath(playerIndexUrl(firstLetterLastName)).filePath,
  parse: ($: cheerio.CheerioAPI) => parse($)
});
