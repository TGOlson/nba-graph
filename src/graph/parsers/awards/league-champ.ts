import * as cheerio from 'cheerio';

import { LEAGUE_CHAMP_URL, localPath } from "../../util/bref-url";
import { Award, AwardRecipient, LeagueId } from "../../../shared/nba-types";
import { HtmlParser } from "../html-parser";

const TEAM_URL_REGEX = /teams\/([A-Z]{3})\/(\d{4}).html/;

type AwardParseResult = {
  awards: Award[],
  awardRecipients: AwardRecipient[],
};

const SELECTOR = 'table#champions_index tbody tr:not(.thead)';

const parse = ($: cheerio.CheerioAPI): AwardParseResult => {
  // cache of awards, use this to dedupe
  // because of the way this parser is structured, we'll end up w/ dupes (eg. multiple champion awards)
  const awards: {[key: string]: Award} = {};

  const awardRecipients = $(SELECTOR).toArray().map((el: cheerio.AnyNode) => {
    const yearStr = $('th[data-stat="year_id"] a[href]', el).text();
    const leagueId = $('td[data-stat="lg_id"] a[href]', el).text() as LeagueId;

    const urlPieces = LEAGUE_CHAMP_URL.split('/');
    const url = '/' + urlPieces.slice(urlPieces.length - 1).join('/');
    
    const awardId = `LEAGUE_CHAMP_${leagueId}`;

    awards[awardId] = {
      id: awardId,
      name: `${leagueId} League Champion`,
      image: {type: 'award', id: 'champ'},
      leagueId,
      url,
    };

    const teamLink = $('td[data-stat="champion"] a', el).attr('href');
    if(!teamLink) throw new Error(`Expected to find team link on playoff page: ${leagueId}`);

    const teamRes = TEAM_URL_REGEX.exec(teamLink);

    if (!teamRes?.[1] || !teamRes[2]) throw new Error(`Unable to parse team url on playoff page: ${teamLink}`);

    const [_, yearAppropriateFranchiseId, year] = teamRes;

    const teamId = `${yearAppropriateFranchiseId}_${year}`;

    const awardRecipient: AwardRecipient = {
      awardId,
      recipientId: teamId,
      year: parseInt(yearStr),
      url
    };

    return awardRecipient;
  });

  return {
    awards: Object.values(awards),
    awardRecipients,
  };
};

export const leagueChampAwardsParser: HtmlParser<AwardParseResult> = {
  inputPath: localPath(LEAGUE_CHAMP_URL).filePath,
  parse: ($: cheerio.CheerioAPI) => parse($)
};
