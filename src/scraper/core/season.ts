import * as cheerio from 'cheerio';
import { Season } from '../../shared/nba-types';

import { LEAGUES_URL } from '../util/bref-url';
import { Fetch } from '../util/fetch';

const SELECTOR = 'tr th a[href]';
const URL_REGEX = /([A-Z]{3})_(\d{4}).html/;

export async function getSeasons(fetch: Fetch): Promise<Season[]> {
  const response = await fetch(LEAGUES_URL);
  const body = await response.text();
  
  const $ = cheerio.load(body);

  return $(SELECTOR).toArray().map((el: cheerio.Element) => {
    const url = el.attribs.href;

    if (!url) {
      throw new Error('Invalid response from leagues: unparseable url');
    }

    const res = URL_REGEX.exec(url);

    if (!res?.[1] || !res[2]) {
      throw new Error('Invalid response from leagues: unparseable url');
    }

    const [_, leagueId, year] = res;

    return {
      id: `${leagueId}_${year}`,
      leagueId,
      year: parseInt(year),
      url,
    };
  });
}
