import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import https from 'node:https';

import { fromRelative } from '../util/bref-url';
import { Team } from './team';

export type Player = {
  id: string;
  name: string;
  url: string;
}

const SELECTOR = 'table#roster tbody tr';
const URL_REGEX = /players\/[a-z]{1}\/([a-z]{2,}\d{2}).html/

export async function getPlayers(agent: https.Agent, team: Team): Promise<Player[]> {
  const response = await fetch(fromRelative(team.url), { agent });
  const body = await response.text();
  
  const $ = cheerio.load(body)

  return $(SELECTOR).toArray().map((el: cheerio.AnyNode) => {
    const url = $('td[data-stat="player"] a', el).attr('href');
    const name = $('td[data-stat="player"] a[href]', el).text();

    if (!url) {
      throw new Error('Invalid response from player: no url')
    }
    
    const res = URL_REGEX.exec(url);
        
    if (!res || res.length === 1) {
      throw new Error(`Invalid response from team: unparseable url. ${url}`)
    } 
    
    const [_, playerId] = res;

    return {
      id: playerId,
      name,
      url,
    }
  });
}
