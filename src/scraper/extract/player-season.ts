import * as cheerio from 'cheerio';
import path from "path";

import { localPath, playerUrl } from "../util/bref-url";
import { PlayerSeason } from "../../shared/nba-types";
import { Extractor } from "./extractor";

const SELECTOR = 'table#per_game tbody tr';
const URL_REGEX = /teams\/([A-Z]{3})\/(\d{4}).html/;

const extract = (playerId: string, body: string): PlayerSeason[] => {
  const $ = cheerio.load(body);

  const maybePlayerSeasons = $(SELECTOR).toArray().map((el: cheerio.AnyNode) => {
    const playerLink = $('th a', el).attr('href');
    const teamLink = $('td[data-stat="team_id"] a', el).attr('href');

    // If there is no team link, this is a rollup because the player was on multiple teams
    // Could also check for team name == "TOT"
    if (!teamLink) {
      return null;
    }

    if (!playerLink || !teamLink) {
      throw new Error('Invalid response from player: no link');
    }
    
    const res = URL_REGEX.exec(teamLink);
        
    if (!res?.[1] || !res[2]) {
      throw new Error('Invalid response from team: unparseable url');
    } 
    
    const [_, franchiseId, year] = res;
    
    return {
      playerId: playerId,
      teamId: `${franchiseId}_${year}`,
      url: playerLink,
    };
  });

  return just(maybePlayerSeasons);
};

export const makePlayerSeasonExtractor = (playerId: string): Extractor<PlayerSeason[]> => ({
  inputPath: localPath(playerUrl(playerId)).filePath,
  outputDir: path.resolve(__dirname, `../data/extracted/players/${playerId[0] ?? '_'}`),
  outputFileName: `${playerId}.json`,
  extract: (str: string) => extract(playerId, str)
});

function just<T> (xs: (T | null)[]): T[] {
  return xs.filter(x => x !== null) as T[];
}
