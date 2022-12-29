import * as cheerio from 'cheerio';
import path from "path";

import { localPath, TEAMS_URL } from "../util/bref-url";
import { Franchise } from "../../shared/nba-types";
import { Extractor } from "./extractor";

const BASE_SELECTOR = 'table.stats_table tbody tr.full_table';
const ACTIVE_SELECTOR = `#all_teams_active ${BASE_SELECTOR}`;
const DEFUNCT_SELECTOR = `#all_teams_defunct ${BASE_SELECTOR}`;
const URL_REGEX = /teams\/([A-Z]{3})\//;

const extractFranchises = (body: string, active: boolean): Franchise[] => {
  const $ = cheerio.load(body);

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

    return {
      id,
      name,
      url,
      active,
    };
  });
};

export const FranchiseExtractor: Extractor<Franchise[]> = {
  inputPath: localPath(TEAMS_URL).filePath,
  outputDir: path.resolve(__dirname, '../data/extracted'),
  outputFileName: 'franchises.json',
  extract: (str: string): Franchise[] => {
    const activeFranchises = extractFranchises(str, true);
    const defunctFranchises = extractFranchises(str, false);
    
    return [...activeFranchises, ...defunctFranchises];
  }
};
