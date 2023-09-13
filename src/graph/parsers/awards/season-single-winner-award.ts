import * as cheerio from 'cheerio';

import { awardUrls, localPath } from "../../util/bref-url";
import { Award, AwardRecipient } from "../../../shared/nba-types";
import { HtmlParser } from "../html-parser";
import { AwardImageId, LeagueId } from '../../util/assets';

type AwardConfig = {
  makeName: (leagueId: string) => string,
  baseAwardId: string,
  baseTableSelector: string,
  imageId: AwardImageId,
  url: string,
};

const singleWinnerTableSelector = (baseId: string): string => `table#${baseId}NBA tbody tr,table#${baseId}ABA tbody tr`;
const SINGLE_WINNER_PLAYER_SELECTOR = 'td[data-stat="player"] a';

const AWARD_CONFIG: AwardConfig[] = [
  {
    makeName: (leagueId: string) => `${leagueId} Most Valuable Player (MVP)`,
    baseAwardId: 'MVP_',
    baseTableSelector: 'mvp_',
    imageId: 'mvp',
    url: awardUrls.mvp,
  },
  {
    makeName: (leagueId: string) => `${leagueId} Defensive Player of the Year (DPOY)`,
    baseAwardId: 'DPOY_',
    baseTableSelector: 'dpoy_',
    imageId: 'trophy',
    url: awardUrls.dpoy,
  },
  {
    makeName: (leagueId: string) => `${leagueId} Rookie of the Year (ROY)`,
    baseAwardId: 'ROY_',
    baseTableSelector: 'roy_',
    imageId: 'trophy',
    url: awardUrls.roy,
  },
  {
    makeName: (leagueId: string) => `${leagueId} Sixth Man of the Year (SMOY)`,
    baseAwardId: 'SMOY_',
    baseTableSelector: 'smoy_',
    imageId: 'trophy',
    url: awardUrls.smoy,
  },
  {
    makeName: (leagueId: string) => `${leagueId} Most Improved Player (MIP)`,
    baseAwardId: 'MIP_',
    baseTableSelector: 'mip_',
    imageId: 'trophy',
    url: awardUrls.mip,
  },
  {
    makeName: (leagueId: string) => `${leagueId} Teammate of the Year`,
    baseAwardId: 'TMOY_',
    baseTableSelector: 'tmoy_',
    imageId: 'trophy',
    url: awardUrls.tmoy,
  },
  {
    makeName: (leagueId: string) => `${leagueId} Citizenship Award`,
    baseAwardId: 'CITIZENSHIP_',
    baseTableSelector: 'citizenship_',
    imageId: 'trophy',
    url: awardUrls.citizenship,
  },
  {
    makeName: (leagueId: string) => `${leagueId} All-Star MVP`,
    baseAwardId: 'ALL_STAR_MVP_',
    baseTableSelector: 'all_star_mvp_',
    imageId: 'allstar_mvp',
    url: awardUrls.all_star_mvp,
  },
  {
    makeName: (leagueId: string) => `${leagueId} Finals MVP`,
    baseAwardId: 'FINALS_MVP_',
    baseTableSelector: 'finals_mvp_',
    imageId: 'finals_mvp',
    url: awardUrls.finals_mvp,
  },
];

const URL_REGEX = /players\/[a-z]{1}\/([a-z]{2,}\d{2}).html/;

type AwardParseResult = {
  awards: Award[],
  awardRecipients: AwardRecipient[],
};

const parse = ($: cheerio.CheerioAPI, config: AwardConfig): AwardParseResult => {
  // cache of awards & season awards, use this to dedupe
  // because of the way this parser is structured, we'll end up w/ dupes (eg. multiple MVP_NBA awards)
  const awards: {[key: string]: Award} = {};

  const tableSelector = singleWinnerTableSelector(config.baseTableSelector);
  const awardRecipients: AwardRecipient[] = $(tableSelector).toArray().flatMap((el: cheerio.AnyNode) => {
    const yearStr = $('th[data-stat="season"] a[href]', el).text();
    const year = parseInt(yearStr.split('-')[0] as string) + 1;

    const leagueId = $('td[data-stat="lg_id"] a[href]', el).text() as LeagueId;
    const awardId = `${config.baseAwardId}${leagueId}`;
    
    const urlPieces = config.url.split('/');
    const url = '/' + urlPieces.slice(urlPieces.length - 2).join('/');
    
    awards[awardId] = {
      id: awardId,
      name: config.makeName(leagueId),
      leagueId,
      image: {type: 'award', id: config.imageId},
      url,
    };
    
    const playerUrl = $(SINGLE_WINNER_PLAYER_SELECTOR, el).attr('href');

    if (!playerUrl) {
      throw new Error('Invalid response from player: no playerUrl');
    }
    
    const res = URL_REGEX.exec(playerUrl);
        
    if (!res?.[1] || res.length === 1) {
      throw new Error(`Invalid response from team: unparseable url. ${playerUrl}`);
    } 
    
    const [_, playerId] = res;

    return {
      awardId,
      recipientId: playerId,
      year,
      url,
    };
  });

  return {
    awards: Object.values(awards),
    awardRecipients,
  };
};

export const seasonSingleWinnerAwardsParser: HtmlParser<AwardParseResult>[] = AWARD_CONFIG.flatMap(config => {
  return {
    inputPath: localPath(config.url).filePath,
    parse: ($: cheerio.CheerioAPI) => parse($, config)
  };
});
