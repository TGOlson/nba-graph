import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { BrefURL, fromRelative, compact, expand } from '../util/bref-url';
import { Team } from './team';

export type Player = {
	id: string;
	name: string;
	url: BrefURL;
}

const SELECTOR = 'table#roster tbody tr';
const URL_REGEX = /players\/[a-z]{1}\/([a-z]{2,}\d{2}).html/

export async function getPlayers(team: Team): Promise<Player[]> {
  const response = await fetch(expand(team.url));
  const body = await response.text();
  
  const $ = cheerio.load(body)

  return $(SELECTOR).toArray().map((el: cheerio.AnyNode) => {
    const link = $('td[data-stat="player"] a', el).attr('href');
    const name = $('td[data-stat="player"] a[href]', el).text();

    if (!link) {
      throw new Error('Invalid response from player: no link')
    }
    
    const res = URL_REGEX.exec(link);
        
    if (!res || res.length === 1) {
      throw new Error(`Invalid response from team: unparseable url. ${link}`)
    } 
    
    const [_, playerId] = res;
    
    return {
      id: playerId,
      name,
      url: compact(fromRelative(link)),
    }
  });
}
