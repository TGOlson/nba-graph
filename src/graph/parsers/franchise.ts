import * as cheerio from 'cheerio';

import { getFranchiseLogoUrl, localPath, TEAMS_URL } from "../util/bref-url";
import { Franchise } from "../../shared/nba-types";
import { HtmlParser } from "./html-parser";

const BASE_SELECTOR = 'table.stats_table tbody tr.full_table';
const ACTIVE_SELECTOR = `#all_teams_active ${BASE_SELECTOR}`;
const DEFUNCT_SELECTOR = `#all_teams_defunct ${BASE_SELECTOR}`;
const URL_REGEX = /teams\/([A-Z]{3})\//;

const parseFranchises = ($: cheerio.CheerioAPI, active: boolean): Franchise[] => {
  const selector = active ? ACTIVE_SELECTOR : DEFUNCT_SELECTOR;

  return $(selector).toArray().map((el: cheerio.AnyNode) => {
    const aRef = $('th a', el);
    const name = aRef.text();
    const url = aRef.attr('href');
    
    if (!url) {
      throw new Error('Invalid response from franchise: no url');
    }
    
    const res = URL_REGEX.exec(url);
        
    if (!res?.[1]) {
      throw new Error('Invalid response from franchise: unparseable url');
    }
    
    const [_, id] = res;

    const image = getFranchiseLogoUrl(id);
    
    return {
      id,
      name,
      active,
      image,
      url,
    };
  });
};

export const franchiseParser: HtmlParser<Franchise[]> = {
  inputPath: localPath(TEAMS_URL).filePath,
  parse: ($: cheerio.CheerioAPI): Franchise[] => [...parseFranchises($, true), ...parseFranchises($, false)]
};
