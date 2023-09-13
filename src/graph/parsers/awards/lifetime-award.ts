import * as cheerio from 'cheerio';

import { awardUrls, localPath } from "../../util/bref-url";
import { Award, AwardRecipient } from "../../../shared/nba-types";
import { HtmlParser } from "../html-parser";

type AwardConfig = {
  name: string,
  awardId: string,
  playerSelector: string,
  image: Award['image'],
  url: string,
};

const AWARD_CONFIG: AwardConfig[] = [
  {
    name: 'NBA 75th Anniversary Team',
    awardId: 'NBA_75_ANNIVERSARY',
    playerSelector: 'table#stats tbody tr th[data-stat="player"] a',
    image: {type: 'league', id: 'NBA'},
    url: awardUrls.nba_75th_anniversary,
  },
  {
    name: '50 Greatest Players in NBA History',
    awardId: 'NBA_50_GREATEST',
    playerSelector: 'table#stats tbody tr th[data-stat="player"] a',
    image: {type: 'league', id: 'NBA'},
    url: awardUrls.nba_50_greatest,
  },
  {
    name: 'ABA All-Time Team',
    awardId: 'ABA_ALL_TIME_TEAM',
    playerSelector: 'table#stats tbody tr th[data-stat="player"] a',
    image: {type: 'league', id: 'ABA'},
    url: awardUrls.aba_all_time_team,
  },
  {
    name: 'Basketball Hall of Fame',
    awardId: 'HOF',
    playerSelector: 'table#hof tbody tr a[href^="/players"]',
    image: {type: 'award', id: 'hof'},
    url: awardUrls.hof,
  },
];

const URL_REGEX = /players\/[a-z]{1}\/([a-z]{2,}\d{2}).html/;

type AwardParseResult = {
  award: Award,
  awardRecipients: AwardRecipient[],
};

const parse = ($: cheerio.CheerioAPI, config: AwardConfig): AwardParseResult => {
  const urlPieces = config.url.split('/');
  const url = '/' + urlPieces.slice(urlPieces.length - 2).join('/');

  const award: Award = {
    id: config.awardId,
    name: config.name,
    leagueId: 'NBA',
    image: config.image,
    url,
  };

  const awardRecipients: AwardRecipient[] = $(config.playerSelector).toArray().flatMap((el: cheerio.AnyNode) => {
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
      awardId: award.id,
      recipientId: playerId,
      year: null,
      url,
    };
  });

  // dedupe because for some awards people are listed multiple times (eg. some players/coaches inducted to HOF multiple times)
  const dedupedRecipients: AwardRecipient[] = awardRecipients.reduce((acc: AwardRecipient[], curr: AwardRecipient) => {
    const existing = acc.find(x => x.recipientId === curr.recipientId);
    if (!existing) {
      return [...acc, curr];
    } else {
      return acc;
    }
  }, []);

  return {
    award,
    awardRecipients: dedupedRecipients,
  };
};

export const lifetimeAwardParser: HtmlParser<AwardParseResult>[] = AWARD_CONFIG.flatMap(config => {
  return {
    inputPath: localPath(config.url).filePath,
    parse: ($: cheerio.CheerioAPI) => parse($, config)
  };
});
