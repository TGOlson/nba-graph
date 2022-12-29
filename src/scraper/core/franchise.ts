import * as cheerio from 'cheerio';
import { Franchise } from '../../shared/nba-types';

import { TEAMS_URL } from '../util/bref-url';
import { Fetch } from '../util/fetch';

const BASE_SELECTOR = 'table.stats_table tbody tr.full_table';
const ACTIVE_SELECTOR = `#all_teams_active ${BASE_SELECTOR}`;
const DEFUNCT_SELECTOR = `#all_teams_defunct ${BASE_SELECTOR}`;
const URL_REGEX = /teams\/([A-Z]{3})\//;

export async function getActiveFranchises(fetch: Fetch): Promise<Franchise[]> {
  return getFranchises(fetch, true);
}

export async function getDefunctFranchises(fetch: Fetch): Promise<Franchise[]> {
  return getFranchises(fetch, false);
}

async function getFranchises(fetch: Fetch, active: boolean): Promise<Franchise[]> {
  const response = await fetch(TEAMS_URL);
  const body = await response.text();
  
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
}
