import * as cheerio from 'cheerio';

import { awardUrls, localPath } from "../../util/bref-url";
import { Award, MultiWinnerAward, AwardRecipient } from "../../../shared/nba-types";
import { HtmlParser } from "../html-parser";
import { assets } from '../../util/assets';

type AwardConfig = {
  makeName: (leagueId: string) => string,
  baseAwardId: string,
  baseTtableSelector: string,
  url: string,
  playerSelector: string,
};

const multiWinnerTableSelector = (baseId: string): string => `table#${baseId} tbody tr:not(.thead)`;
const mutliWinnerPlayerSelector = (num: number): string => Array.from({length: num}, (_, i) => `td[data-stat="${i + 1}"] a`).join(',');

const AWARD_CONFIG: AwardConfig[] = [
  {
    makeName: (leagueId: string) => `All-${leagueId} Team`,
    baseAwardId: 'ALL_LEAGUE_',
    baseTtableSelector: 'awards_all_league',
    url: awardUrls.all_league,
    playerSelector: mutliWinnerPlayerSelector(15),
  },
  {
    makeName: (leagueId: string) => `${leagueId} All-Rookie Team`,
    baseAwardId: 'ALL_ROOKIE_',
    baseTtableSelector: 'awards_all_rookie',
    url: awardUrls.all_rookie,
    playerSelector: mutliWinnerPlayerSelector(10),
  },
  {
    makeName: (leagueId: string) => `${leagueId} All-Defense Team`,
    baseAwardId: 'ALL_DEFENSE_',
    baseTtableSelector: 'awards_all_defense',
    url: awardUrls.all_defense,
    playerSelector: mutliWinnerPlayerSelector(10),
  },
];

const URL_REGEX = /players\/[a-z]{1}\/([a-z]{2,}\d{2}).html/;

type AwardParseResult = {
  awards: Award[],
  multiWinnerAwards: MultiWinnerAward[],
  awardRecipients: AwardRecipient[],
};

const getImage = (leagueId: string): string => {
  switch (leagueId) {
    case 'NBA': return assets.img.league.nba;
    case 'ABA': return assets.img.league.aba;
    case 'BAA': return assets.img.league.baa;
    default: throw new Error(`Invalid leagueId: ${leagueId}`);
  }
};

const parse = ($: cheerio.CheerioAPI, config: AwardConfig): AwardParseResult => {
  // cache of awards & season awards, use this to dedupe
  // because of the way this parser is structured, we'll end up w/ dupes (eg. multiple MVP_NBA awards)
  const awards: {[key: string]: Award} = {};
  const multiWinnerAwards: {[key: string]: MultiWinnerAward} = {};

  const tableSelector = multiWinnerTableSelector(config.baseTtableSelector);
  const awardRecipients: AwardRecipient[] = $(tableSelector).toArray().flatMap((el: cheerio.AnyNode) => {
    const leagueId = $('td[data-stat="lg_id"] a[href]', el).text();
    const awardId = `${config.baseAwardId}${leagueId}`;
    const urlPieces = config.url.split('/');
    const url = '/' + urlPieces.slice(urlPieces.length - 2).join('/');
    
    awards[awardId] = {
      id: awardId,
      name: config.makeName(leagueId),
      leagueId,
      image: getImage(leagueId),
      url,
    };
    
    const yearStr = $('th[data-stat="season"] a[href]', el).text();
    const [yearP] = yearStr.split('-');
    
    if (!yearP) {
      throw new Error(`Invalid response from team: unparseable year. ${yearStr}`);
    }
    
    const year = parseInt(yearP) + 1;
    
    const seasonAwardId = `${awardId}_${year}`;
    const name = `${config.makeName(leagueId)} (${year - 1}-${year.toString().slice(2)})`;
    
    multiWinnerAwards[seasonAwardId] = {
      id: seasonAwardId,
      name,
      awardId,
      image: getImage(leagueId),
      year,
      url,
    };

    return $(config.playerSelector, el).toArray().map((el: cheerio.AnyNode) => {
      const playerUrl = $(el).attr('href');

      if (!playerUrl) {
        throw new Error('Invalid response from player: no playerUrl');
      }
      
      const res = URL_REGEX.exec(playerUrl);
          
      if (!res?.[1] || res.length === 1) {
        throw new Error(`Invalid response from team: unparseable url. ${playerUrl}`);
      } 
      
      const [_, playerId] = res;
  
      return {
        awardId: seasonAwardId,
        recipientId: playerId,
        year,
        url,
      };
    });
  });

  return {
    awards: Object.values(awards),
    multiWinnerAwards: Object.values(multiWinnerAwards),
    awardRecipients,
  };
};

export const seasonMultiWinnerAwardsParser: HtmlParser<AwardParseResult>[] = AWARD_CONFIG.flatMap(config => {
  return {
    inputPath: localPath(config.url).filePath,
    parse: ($: cheerio.CheerioAPI) => parse($, config)
  };
});
