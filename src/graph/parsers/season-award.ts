import * as cheerio from 'cheerio';

import { awardUrls, localPath } from "../util/bref-url";
import { SeasonAward } from "../../shared/nba-types";
import { HtmlParser } from "./html-parser";

type AwardConfig = {
  name: string,
  baseAwardId: string,
  tableSelector: string,
  url: string,
  playerSelector: string,
};

const singleWinnerTableSelector = (baseId: string): string => `table#${baseId}NBA tbody tr,table#${baseId}ABA tbody tr`;
const multiWinnerTableSelector = (baseId: string): string => `table#${baseId} tbody tr:not(.thead)`;

const SINGLE_WINNER_PLAYER_SELECTOR = 'td[data-stat="player"] a';
// const MUTLI_WINNER_PLAYER_SELECTOR = 'td[data-stat="1"] a,td[data-stat="2"] a,td[data-stat="3"] a,td[data-stat="4"] a,td[data-stat="5"] a';
const mutliWinnerPlayerSelector = (num: number): string => Array.from({length: num}, (_, i) => `td[data-stat="${i + 1}"] a`).join(',');

const AWARD_CONFIG: AwardConfig[] = [
  {
    name: 'Most Valuable Player',
    baseAwardId: 'MVP_',
    tableSelector: singleWinnerTableSelector('mvp_'),
    url: awardUrls.mvp,
    playerSelector: SINGLE_WINNER_PLAYER_SELECTOR,
  },
  {
    name: 'Defensive Player of the Year',
    baseAwardId: 'DPOY_',
    tableSelector: singleWinnerTableSelector('dpoy_'),
    url: awardUrls.dpoy,
    playerSelector: SINGLE_WINNER_PLAYER_SELECTOR,
  },
  {
    name: 'Rookie of the Year',
    baseAwardId: 'ROY_',
    tableSelector: singleWinnerTableSelector('roy_'),
    url: awardUrls.roy,
    playerSelector: SINGLE_WINNER_PLAYER_SELECTOR,
  },
  {
    name: 'Sixth Man of the Year',
    baseAwardId: 'SMOY_',
    tableSelector: singleWinnerTableSelector('smoy_'),
    url: awardUrls.smoy,
    playerSelector: SINGLE_WINNER_PLAYER_SELECTOR,
  },
  {
    name: 'Most Improved Player',
    baseAwardId: 'MIP_',
    tableSelector: singleWinnerTableSelector('mip_'),
    url: awardUrls.mip,
    playerSelector: SINGLE_WINNER_PLAYER_SELECTOR,
  },
  {
    name: 'Teammate of the Year',
    baseAwardId: 'TMOY_',
    tableSelector: singleWinnerTableSelector('tmoy_'),
    url: awardUrls.tmoy,
    playerSelector: SINGLE_WINNER_PLAYER_SELECTOR,
  },
  {
    name: 'Citizenship Award',
    baseAwardId: 'CITIZENSHIP_',
    tableSelector: singleWinnerTableSelector('citizenship_'),
    url: awardUrls.citizenship,
    playerSelector: SINGLE_WINNER_PLAYER_SELECTOR,
  },
  {
    name: 'All-Star MVP',
    baseAwardId: 'ALL_STAR_MVP_',
    tableSelector: singleWinnerTableSelector('all_star_mvp_'),
    url: awardUrls.all_star_mvp,
    playerSelector: SINGLE_WINNER_PLAYER_SELECTOR,
  },
  {
    name: 'Finals MVP',
    baseAwardId: 'FINALS_MVP_',
    tableSelector: singleWinnerTableSelector('finals_mvp_'),
    url: awardUrls.finals_mvp,
    playerSelector: SINGLE_WINNER_PLAYER_SELECTOR,
  },
  {
    name: 'All-League Team',
    baseAwardId: 'ALL_LEAGUE_',
    tableSelector: multiWinnerTableSelector('awards_all_league'),
    url: awardUrls.all_league,
    playerSelector: mutliWinnerPlayerSelector(15),
  },
  {
    name: 'All-Rookie Team',
    baseAwardId: 'ALL_ROOKIE_',
    tableSelector: multiWinnerTableSelector('awards_all_rookie'),
    url: awardUrls.all_rookie,
    playerSelector: mutliWinnerPlayerSelector(10),
  },
  {
    name: 'All-Defense Team',
    baseAwardId: 'ALL_DEFENSE_',
    tableSelector: multiWinnerTableSelector('awards_all_defense'),
    url: awardUrls.all_defense,
    playerSelector: mutliWinnerPlayerSelector(10),
  },
];

const URL_REGEX = /players\/[a-z]{1}\/([a-z]{2,}\d{2}).html/;

const parse = ($: cheerio.CheerioAPI, config: AwardConfig): SeasonAward[] => {
  return $(config.tableSelector).toArray().flatMap((el: cheerio.AnyNode) => {
    const leagueId = $('td[data-stat="lg_id"] a[href]', el).text();
    const awardId = `${config.baseAwardId}${leagueId}`;
    const urlPieces = config.url.split('/');
    const url = '/' + urlPieces.slice(urlPieces.length - 2).join('/');
    
    const yearStr = $('th[data-stat="season"] a[href]', el).text();
    const [year] = yearStr.split('-');

    if (!year) {
      throw new Error(`Invalid response from team: unparseable year. ${yearStr}`);
    }

    // const playerUrl = $(config.playerSelector, el).attr('href');
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
        id: `${awardId}_${year}`,
        name: config.name,
        awardId,
        playerId,
        year: parseInt(year) + 1,
        url,
      };
    });
  });
};

export const seasonAwardsParser: HtmlParser<SeasonAward[]>[] = AWARD_CONFIG.flatMap(config => {
  return {
    inputPath: localPath(config.url).filePath,
    parse: ($: cheerio.CheerioAPI) => parse($, config)
  };
});