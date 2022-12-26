import * as cheerio from 'cheerio';
import { Season } from '../../shared/nba-types';

import { fromRelative } from '../util/bref-url';
import { Fetch } from '../util/fetch';

const RELATIVE_URL = '/leagues';
const SELECTOR = 'tr th a[href]';
const URL_REGEX = /([A-Z]{3})_(\d{4}).html/;

export async function getSeasons(fetch: Fetch): Promise<Season[]> {
  const response = await fetch(fromRelative(RELATIVE_URL));
  const body = await response.text();
  
  const $ = cheerio.load(body);

  return $(SELECTOR).toArray().map((el: cheerio.Element) => {
    const url = el.attribs.href;

    const res = URL_REGEX.exec(url);

    if (!res) {
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