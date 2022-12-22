import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import https from 'node:https';

import { fromRelative } from '../util/bref-url';

export type Franchise = {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

const RELATIVE_URL = '/teams'
const BASE_SELECTOR = 'table.stats_table tbody tr.full_table'
const ACTIVE_SELECTOR = `#all_teams_active ${BASE_SELECTOR}`
const DEFUNCT_SELECTOR = `#all_teams_defunct ${BASE_SELECTOR}`
const URL_REGEX = /teams\/([A-Z]{3})\//;

export async function getActiveFranchises(agent: https.Agent): Promise<Franchise[]> {
  return getFranchises(agent, true);
}

export async function getDefunctFranchises(agent: https.Agent): Promise<Franchise[]> {
  return getFranchises(agent, false);
}

async function getFranchises(agent: https.Agent, active: boolean): Promise<Franchise[]> {
  const response = await fetch(fromRelative(RELATIVE_URL), { agent });
  const body = await response.text();
  
  const $ = cheerio.load(body)

  const selector = active ? ACTIVE_SELECTOR : DEFUNCT_SELECTOR;

  return $(selector).toArray().map((el: cheerio.AnyNode) => {
    const aRef = $('th a', el);
    const name = aRef.text();
    const url = aRef.attr('href');
    
    if (!url) {
      throw new Error('Invalid response from franchise: no url')
    }
    
    const res = URL_REGEX.exec(url);
        
    if (!res) {
      throw new Error('Invalid response from franchise: unparseable url')
    }
    
    const [_, id] = res;

    return {
      id,
      name,
      url,
      active,
    }
  });
}
