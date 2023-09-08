import * as cheerio from 'cheerio';

import { LEAGUES_URL, allStarUrl, localPath } from "../../util/bref-url";
import { Award, MultiWinnerAward, AwardRecipient } from "../../../shared/nba-types";
import { HtmlParser } from "../html-parser";
import { assets } from '../../util/assets';

// kind weird selector, but basically slurp up all links like "/players/..."
// it's easy to parse all the start from the boxscore, but injuries are represented differently
const SELECTOR = '#content a[href*=players]';
const URL_REGEX = /players\/[a-z]{1}\/([a-z]{2,}\d{2}).html/;

export const ALL_STAR_AWARDS: Award[] = [
  {
    id: 'ALL_STAR_NBA',
    name: 'NBA All-Star Team',
    leagueId: 'NBA',
    image: assets.img.award.medal,
    url: LEAGUES_URL,
  },
  {
    id: 'ALL_STAR_ABA',
    name: 'ABA All-Star Team',
    leagueId: 'ABA',
    image: assets.img.award.medal,
    url: LEAGUES_URL,
  }
];

type AllStarParseResult = {
  mutliWinnerAward: MultiWinnerAward,
  awardRecipients: AwardRecipient[],
};

const nbaYears = Array.from({length: 73}, (_, i) => 1951 + i).filter(y => y !== 1999).map(x => `NBA_${x}`).reverse();
const abaYears = Array.from({length: 9}, (_, i) => 1968 + i).map(x => `ABA_${x}`).reverse();

export const validAllStarSeasons: string[] = [...nbaYears, ...abaYears];

const parse = ($: cheerio.CheerioAPI, seasonId: string): AllStarParseResult => {

  const [leagueId, yearStr] = seasonId.split('_');

  if (!leagueId || !yearStr) throw new Error(`Invalid seasonId: ${seasonId}`);

  const urlPieces = allStarUrl(seasonId).split('/');
  const url = '/' + urlPieces.slice(urlPieces.length - 2).join('/');
  
  const year = parseInt(yearStr);

  const mutliWinnerAward: MultiWinnerAward = {
    id: `ALL_STAR_${seasonId}`,
    name: `${leagueId} All-Star Team (${year})`,
    awardId: `ALL_STAR_${leagueId}`,
    image: assets.img.award.medal,
    year,
    url,
  };

  const awardRecipients: AwardRecipient[] = $(SELECTOR).toArray().map((el: cheerio.AnyNode) => {
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
      recipientId: playerId,
      awardId: mutliWinnerAward.id,
      url,
    };
  });

  const dedupedRecipients: AwardRecipient[] = awardRecipients.reduce((acc: AwardRecipient[], curr: AwardRecipient) => {
    const existing = acc.find(x => x.recipientId === curr.recipientId);
    if (!existing) {
      return [...acc, curr];
    } else {
      return acc;
    }
  }, []);

  return {
    mutliWinnerAward,
    awardRecipients: dedupedRecipients,
  };
};

export const allStarParser: HtmlParser<AllStarParseResult>[] = validAllStarSeasons.map(seasonId => {
  return {
    inputPath: localPath(allStarUrl(seasonId)).filePath,
    parse: ($: cheerio.CheerioAPI) => parse($, seasonId)
  };
});
