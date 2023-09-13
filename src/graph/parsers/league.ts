import * as cheerio from 'cheerio';

import { LEAGUES_URL, localPath, toRelative } from "../util/bref-url";
import { League, LeagueId } from "../../shared/nba-types";
import { HtmlParser } from "./html-parser";

const SELECTOR = 'tr th a[href]';
const URL_REGEX = /([A-Z]{3})_(\d{4}).html/;


export const parse = ($: cheerio.CheerioAPI): League[] => {
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
      id: leagueId as LeagueId,
      url: toRelative(LEAGUES_URL),
    };
  });

  const initial: {[key: string]: League} = {};

  const leagueMap = leaguesWithDupes.reduce((accum, league) => {
    const res: League | undefined = accum[league.id];

    if (!res) {
      return {...accum, [league.id]: league};
    }

    return accum;
  }, initial);

  return Object.values(leagueMap);
};

export const leagueParser: HtmlParser<League[]> = {
  inputPath: localPath(LEAGUES_URL).filePath,
  parse,
};
