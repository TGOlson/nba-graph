import * as cheerio from 'cheerio';

import { awardUrls, localPath } from "../../util/bref-url";
import { Award, AwardRecipient } from "../../../shared/nba-types";
import { HtmlParser } from "../html-parser";

type AwardConfig = {
  name: string,
  awardId: string,
  tableSelector: string,
  url: string,
};

const AWARD_CONFIG: AwardConfig[] = [
  {
    name: 'NBA 75th Anniversary Team',
    awardId: 'NBA_75_ANNIVERSARY',
    tableSelector: 'table#stats tbody tr',
    url: awardUrls.nba_75th_anniversary,
  },
  {
    name: '50 Greatest Players in NBA History',
    awardId: 'NBA_50_GREATEST',
    tableSelector: 'table#stats tbody tr',
    url: awardUrls.nba_50_greatest,
  },
  {
    name: 'ABA All-Time Team',
    awardId: 'ABA_ALL_TIME_TEAM',
    tableSelector: 'table#stats tbody tr',
    url: awardUrls.aba_all_time_team,
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

  const award = {
    id: config.awardId,
    name: config.name,
    leagueId: 'NBA',
    url,
  };

  const awardRecipients: AwardRecipient[] = $(config.tableSelector).toArray().flatMap((el: cheerio.AnyNode) => {
    const playerUrl = $('th[data-stat="player"] a', el).attr('href');

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
      recipient: {type: 'player', id: playerId},
      url,
    };
  });

  return {
    award,
    awardRecipients,
  };
};

export const lifetimeAwardParser: HtmlParser<AwardParseResult>[] = AWARD_CONFIG.flatMap(config => {
  return {
    inputPath: localPath(config.url).filePath,
    parse: ($: cheerio.CheerioAPI) => parse($, config)
  };
});
