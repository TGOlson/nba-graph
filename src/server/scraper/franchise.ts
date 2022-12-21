import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { BrefURL, fromRelative, compact } from '../util/bref-url';

export type Franchise = {
	id: string;
	name: string;
	url: BrefURL;
  active: boolean;
}

const RELATIVE_URL = '/teams'
const BASE_SELECTOR = 'table.stats_table tbody tr.full_table'
const ACTIVE_SELECTOR = `#all_teams_active ${BASE_SELECTOR}`
const DEFUNCT_SELECTOR = `#all_teams_defunct ${BASE_SELECTOR}`
const URL_REGEX = /teams\/([A-Z]{3})\//;

export async function getActiveFranchises(): Promise<Franchise[]> {
  return getFranchises(true);
}

export async function getDefunctFranchises(): Promise<Franchise[]> {
  return getFranchises(false);
}

async function getFranchises(active: boolean): Promise<Franchise[]> {
  const response = await fetch(fromRelative(RELATIVE_URL));
  const body = await response.text();
  
  const $ = cheerio.load(body)

  const selector = active ? ACTIVE_SELECTOR : DEFUNCT_SELECTOR;

  return $(selector).toArray().map((el: cheerio.AnyNode) => {
    const aRef = $('th a', el);
    const name = aRef.text();
    const link = aRef.attr('href');
    
    if (!link) {
      throw new Error('Invalid response from franchise: no link')
    }
    
    const res = URL_REGEX.exec(link);
        
    if (!res) {
      throw new Error('Invalid response from franchise: unparseable url')
    }
    
    const [_, id] = res;

    return {
      id,
      name,
      url: compact(fromRelative(link)),
      active,
    }
  });
}
