import * as cheerio from 'cheerio';
import path from "path";

import { LEAGUES_URL, localPath, toRelative } from "../util/bref-url";
import { League } from "../../shared/nba-types";
import { Extractor } from "./extractor";

const SELECTOR = 'tr th a[href]';
const URL_REGEX = /([A-Z]{3})_(\d{4}).html/;


export const extractLeagues = (body: string): League[] => {
  const $ = cheerio.load(body);

  const leaguesWithDupes = $(SELECTOR).toArray().map((el: cheerio.Element) => {
    const url = el.attribs.href;

    if (!url) {
      throw new Error('Invalid response from leagues: unparseable url');
    }

    const res = URL_REGEX.exec(url);

    if (!res?.[1]) {
      throw new Error('Invalid response from leagues: unparseable url');
    }

    const [_, leagueId] = res;

    return {
      id: leagueId,
      url: toRelative(LEAGUES_URL),
    };
  });

  const initial: {[key: string]: League} = {};

  const leagueMap = leaguesWithDupes.reduce((accum, league) => {
    const res = accum[league.id];

    if (res) {
      return accum;
    }

    return {...accum, [league.id]: league};
  }, initial);

  return Object.values(leagueMap);
};

export const LeagueExtractor: Extractor<League[]> = {
  inputPath: localPath(LEAGUES_URL).filePath,
  outputDir: path.resolve(__dirname, '../data/extracted'),
  outputFileName: 'leagues.json',
  extract: extractLeagues,
};
