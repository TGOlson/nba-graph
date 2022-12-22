import * as cheerio from 'cheerio';

import { fromRelative } from '../util/bref-url';
import { Franchise } from './franchise';
import { Fetch } from '../util/fetch';

export type Team = {
  id: string;
  franchiseId: string;
  seasonId: string;
  name: string;
  year: number;
  url: string;
}

const SELECTOR = 'table.stats_table tbody tr'
const TEAM_URL_REGEX = /teams\/([A-Z]{3})\/(\d{4}).html/;
const SEASON_URL_REGEX = /([A-Z]{3}_\d{4}).html/;

export async function getTeams(fetch: Fetch, franchise: Franchise): Promise<Team[]> {
  const response = await fetch(fromRelative(franchise.url));
  const body = await response.text();
  
  const $ = cheerio.load(body)

  return $(SELECTOR).toArray().map((el: cheerio.AnyNode) => {
    const teamLink = $('th a', el).attr('href');
    const seasonLink = $('td[data-stat="lg_id"] a', el).attr('href')
    const name = $('td[data-stat="team_name"] a', el).text();
    
    if (!teamLink || !seasonLink) {
      throw new Error('Invalid response from franchise: no link or season url')
    }
    
    const teamRes = TEAM_URL_REGEX.exec(teamLink);
    const seasonRes = SEASON_URL_REGEX.exec(seasonLink);
        
    if (!teamRes || !seasonRes) {
      throw new Error('Invalid response from franchise: unparseable url')
    }
    
    const [_, _franchiseId, year] = teamRes;
    const [_x, seasonId] = seasonRes;

    return {
      id: `${franchise.id}_${year}`,
      franchiseId: franchise.id,
      seasonId,
      name,
      year: parseInt(year),
      url: teamLink,
    }
  });
}
