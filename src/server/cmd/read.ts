import { readFile } from "fs/promises";

import { Franchise } from "../scraper/franchise";
import { League } from "../scraper/league";
import { Player } from "../scraper/player";
import { PlayerTeam } from "../scraper/player-teams";
import { Season } from "../scraper/season";
import { Team } from "../scraper/team";
import { FRANCHISE_PATH, LEAGUE_PATH, PLAYER_PATH, PLAYER_TEAM_PATH, SEASON_PATH, TEAM_PATH } from "./path";

function reader<T> (path: string): () => Promise<T> {
  return () => readFile(path, 'utf8').then(x => JSON.parse(x));
}

export const readSeasons = reader<Season[]>(SEASON_PATH)
export const readLeagues = reader<League[]>(LEAGUE_PATH)
export const readFranchises = reader<Franchise[]>(FRANCHISE_PATH)
export const readTeams = reader<Team[]>(TEAM_PATH)
export const readPlayers = reader<Player[]>(PLAYER_PATH)
export const readPlayerTeams = reader<PlayerTeam[]>(PLAYER_TEAM_PATH)
