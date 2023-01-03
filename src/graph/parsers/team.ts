import * as cheerio from 'cheerio';

import { localPath, teamUrl } from "../util/bref-url";
import { Team } from "../../shared/nba-types";
import { HtmlParser } from "./html-parser";

const SELECTOR = 'table.stats_table tbody tr';
const TEAM_URL_REGEX = /teams\/([A-Z]{3})\/(\d{4}).html/;
const SEASON_URL_REGEX = /([A-Z]{3}_\d{4}).html/;

const parse = (franchiseId: string, $: cheerio.CheerioAPI): Team[] => {
  return $(SELECTOR).toArray().map((el: cheerio.AnyNode) => {
    const teamLink = $('th a', el).attr('href');
    const seasonLink = $('td[data-stat="lg_id"] a', el).attr('href');
    const name = $('td[data-stat="team_name"] a', el).text();
    
    if (!teamLink || !seasonLink) {
      throw new Error('Invalid response from franchise: no link or season url');
    }
    
    const teamRes = TEAM_URL_REGEX.exec(teamLink);
    const seasonRes = SEASON_URL_REGEX.exec(seasonLink);
        
    if (!teamRes?.[1] || !teamRes[2] || !seasonRes?.[1]) {
      throw new Error('Invalid response from franchise: unparseable url');
    }
    
    // A team's franchise id can change each year, which is what we should use for a year based id. 
    // eg. Lakers 2022 -> LAL_2022
    //     Lakers 1950 -> MNL_1950
    // but they should all be linked to overall LAL franchise
    const [_, yearAppropriateFranchiseId, year] = teamRes;
    const [_team, seasonId] = seasonRes;

    return {
      id: `${yearAppropriateFranchiseId}_${year}`,
      franchiseId,
      seasonId,
      name,
      year: parseInt(year),
      url: teamLink,
    };
  });
};

export const makeTeamParser = (franchiseId: string): HtmlParser<Team[]> => ({
  inputPath: localPath(teamUrl(franchiseId)).filePath,
  // outputDir: path.resolve(__dirname, '../data/extracted/teams'),
  // outputFileName: `${franchiseId}.json`,
  parse: ($: cheerio.CheerioAPI) => parse(franchiseId, $)
});
