import * as cheerio from 'cheerio';

import { LEAGUES_URL, allStarUrl, localPath } from "../util/bref-url";
import { Award, SeasonAward, SeasonAwardWinner } from "../../shared/nba-types";
import { HtmlParser } from "./html-parser";

// kind weird selector, but basically slurp up all links like "/players/..."
// it's easy to parse all the start from the boxscore, but injuries are represented differently
const SELECTOR = '#content a[href*=players]';
const URL_REGEX = /players\/[a-z]{1}\/([a-z]{2,}\d{2}).html/;

export const ALL_STAR_AWARDS: Award[] = [
  {
    id: 'ALL_STAR_NBA',
    name: 'All-Star',
    leagueId: 'NBA',
    url: LEAGUES_URL,
  },
  {
    id: 'ALL_STAR_ABA',
    name: 'All-Star',
    leagueId: 'ABA',
    url: LEAGUES_URL,
  }
];

type AllStarParseResult = {
  seasonAward: SeasonAward,
  seasonAwardWinners: SeasonAwardWinner[],
};

const nbaYears = Array.from({length: 73}, (_, i) => 1951 + i).filter(y => y !== 1999).map(x => `NBA_${x}`);
const abaYears = Array.from({length: 9}, (_, i) => 1968 + i).map(x => `ABA_${x}`);

export const validAllStarSeasons: string[] = [...nbaYears, ...abaYears];

const parse = ($: cheerio.CheerioAPI, seasonId: string): AllStarParseResult => {

  const [leagueId, year] = seasonId.split('_');

  if (!leagueId || !year) throw new Error(`Invalid seasonId: ${seasonId}`);

  const urlPieces = allStarUrl(seasonId).split('/');
  const url = '/' + urlPieces.slice(urlPieces.length - 2).join('/');
  
  const seasonAward: SeasonAward = {
    id: `ALL_STAR_${seasonId}`,
    name: 'ALL-STAR',
    awardId: `ALL_STAR_${leagueId}`,
    leagueId,
    year: parseInt(year),
    url,
  };

  const seasonAwardWinners = $(SELECTOR).toArray().map((el: cheerio.AnyNode) => {
    const url = $(el).attr('href');

    if (!url) {
      throw new Error('Invalid response from player: no url');
    }
    
    const res = URL_REGEX.exec(url);
        
    if (!res?.[1] || res.length === 1) {
      throw new Error(`Invalid response from team: unparseable url. ${url}`);
    } 
    
    const [_, playerId] = res;

    return {
      seasonAwardId: seasonAward.id,
      playerId,
      year: parseInt(year),
      url,
    };
  });

  return {
    seasonAward,
    seasonAwardWinners,
  };
};

export const allStarParser: HtmlParser<AllStarParseResult>[] = validAllStarSeasons.map(seasonId => {
  return {
    inputPath: localPath(allStarUrl(seasonId)).filePath,
    parse: ($: cheerio.CheerioAPI) => parse($, seasonId)
  };
});
