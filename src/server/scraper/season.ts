import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { BrefURL, fromRelative, compact } from '../util/bref-url';

export type Season = {
	id: string;
	leagueId: string;
	year: number;
	url: BrefURL;
}

const RELATIVE_URL = '/leagues'
const SELECTOR = 'tr th a[href]'
const URL_REGEX = /([A-Z]{3})_(\d{4}).html/;

export async function getSeasons(): Promise<Season[]> {
  const response = await fetch(fromRelative(RELATIVE_URL));
  const body = await response.text();
  
  const $ = cheerio.load(body)

  return $(SELECTOR).toArray().map((el: cheerio.Element) => {
    const link = el.attribs.href;
    const seasonUrl = fromRelative(link);

    const res = URL_REGEX.exec(link);

    if (!res) {
      throw new Error('Invalid response from leagues: unparseable url')
    }

    const [_, leagueId, year] = res;

    return {
      id: `${leagueId}_${year}`,
      leagueId,
      year: parseInt(year),
      url: compact(seasonUrl),
    }
  });
}
