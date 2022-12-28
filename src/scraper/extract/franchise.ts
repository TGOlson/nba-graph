import { readFile } from "fs/promises";
import * as cheerio from 'cheerio';

import { localPath, TEAMS_URL } from "../util/bref-url";
import { Franchise } from "../../shared/nba-types";

const BASE_SELECTOR = 'table.stats_table tbody tr.full_table';
const ACTIVE_SELECTOR = `#all_teams_active ${BASE_SELECTOR}`;
const DEFUNCT_SELECTOR = `#all_teams_defunct ${BASE_SELECTOR}`;
const URL_REGEX = /teams\/([A-Z]{3})\//;

export async function extractFranchises(): Promise<Franchise[]> {
  const activeFranchises = await extractActiveFranchises();
  const defunctFranchises = await extractDefunctFranchises();

  return [...activeFranchises, ...defunctFranchises];
}

export async function extractActiveFranchises(): Promise<Franchise[]> {
  return extractFranchisesInternal(true);
}

export async function extractDefunctFranchises(): Promise<Franchise[]> {
  return extractFranchisesInternal(false);
}

export async function extractFranchisesInternal(active: boolean): Promise<Franchise[]> {
  const [_dir, filePath] = localPath(TEAMS_URL);

  const page = await readFile(filePath, 'utf8');

  const $ = cheerio.load(page);

  const selector = active ? ACTIVE_SELECTOR : DEFUNCT_SELECTOR;

  return $(selector).toArray().map((el: cheerio.AnyNode) => {
    const aRef = $('th a', el);
    const name = aRef.text();
    const url = aRef.attr('href');
    
    if (!url) {
      throw new Error('Invalid response from franchise: no url');
    }
    
    const res = URL_REGEX.exec(url);
        
    if (!res) {
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
}
