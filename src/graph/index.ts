import { 
  downloadLeagueIndex, downloadPlayer, downloadPlayerIndex, downloadTeam, 
  downloadTeamIndex, downloadTeamAll, downloadPlayerIndexAll, downloadPlayerGroup, 
  downloadPlayerAll, downloadFranchiseImages, downloadTeamImages, downloadPlayerImages, 
  downloadAwards, downloadAllStar 
} from "./commands/download";

import { parseAwards, parseFranchises, parseLeagues, parsePlayers, parseSeasons, parseTeams } from "./commands/parse";
import { buildGraph } from "./commands/graph";
import { convertImages, parsePrimaryColors } from "./commands/image";

import { makeDelayedFetch, makeFetch } from "./util/fetch";

const VERBOSE_FETCH = true;
const FETCH_DELAY_MS = 6000; // basketball-reference seems to get mad at >~30 req/m

const requireArg = (str: string | undefined, msg: string): string => {
  if (!str) throw new Error(`Additional argument required for command: ${msg}`);

  return str;
};

const commands = {
  download: {
    LeagueIndex: '--download-league-index',
    TeamIndex: '--download-team-index',
    Team: '--download-team', // <team-id>
    TeamAll: '--download-team-all',
    PlayerIndex: '--download-player-index', // <a-z letter>
    PlayerIndexAll: '--download-player-index-all',
    Player: '--download-player', // <player-id>
    PlayerGroup: '--download-player-group', // <letter>
    PlayerAll: '--download-player-all', // <target-year?>
    FranchiseImages: '--download-franchise-images',
    TeamImages: '--download-team-images', // <target-year?>
    PlayerImages: '--download-player-images', // <target-year?>
    Awards: '--download-awards',
    AllStar: '--download-allstar',
  },
  parse: {
    Leagues: '--parse-leagues', // NBA, ABA...
    Seasons: '--parse-seasons', // NBA_2015, ABA_1950
    Franchises: '--parse-franchises', // LAL, MIN...
    Teams: '--parse-teams', // LAL_2015, MIN_2022
    Players: '--parse-players', // James Harden + each season
    Awards: '--parse-awards', // MVP, DPOY, etc
  },
  image: {
    ConvertImages: '--convert-images',
    ParsePrimaryColors: '--parse-primary-colors',
  },
  misc: {
    Test: '--test',
  },
  graph: {
    Build: '--build-graph'
  }
};

async function main() {
  const [_, __, cmd, arg] = process.argv;

  const fetch = makeFetch(VERBOSE_FETCH);
  const delayedFetch = makeDelayedFetch(VERBOSE_FETCH, FETCH_DELAY_MS);

  switch (cmd) {
    // *** download commands
    case commands.download.LeagueIndex: return downloadLeagueIndex(fetch);
    case commands.download.TeamIndex: return downloadTeamIndex(fetch);
    case commands.download.Team: return downloadTeam(fetch, requireArg(arg, `${commands.download.Team} <franchise-id>`));
    case commands.download.TeamAll: return downloadTeamAll(delayedFetch);

    case commands.download.PlayerIndex: return downloadPlayerIndex(fetch, requireArg(arg, `${commands.download.PlayerIndex} <a-z letter>`));
    case commands.download.PlayerIndexAll: return downloadPlayerIndexAll(delayedFetch);
    case commands.download.Player: return downloadPlayer(fetch, requireArg(arg, `${commands.download.Player} <player-id>`));
    case commands.download.PlayerGroup: return downloadPlayerGroup(delayedFetch, requireArg(arg, `${commands.download.PlayerGroup} <letter>`));
    case commands.download.PlayerAll: return downloadPlayerAll(delayedFetch, arg ? parseInt(arg) : undefined);

    case commands.download.FranchiseImages: return downloadFranchiseImages(fetch);
    case commands.download.TeamImages: return downloadTeamImages(fetch, arg ? parseInt(arg) : undefined);
    case commands.download.PlayerImages: return downloadPlayerImages(fetch, arg ? parseInt(arg) : undefined);

    case commands.download.Awards: return downloadAwards(delayedFetch);
    case commands.download.AllStar: return downloadAllStar(delayedFetch);

    // *** parse commands
    case commands.parse.Leagues: return parseLeagues();
    case commands.parse.Seasons: return parseSeasons();
    case commands.parse.Franchises: return parseFranchises();
    case commands.parse.Teams: return parseTeams();
    case commands.parse.Players: return parsePlayers();
    case commands.parse.Awards: return parseAwards();

    // *** graph commands
    case commands.graph.Build: return buildGraph();

    // *** misc commands
    case commands.image.ConvertImages: return convertImages();
    case commands.image.ParsePrimaryColors: return parsePrimaryColors();

    // for testing, debugging, etc
    case commands.misc.Test: {
      console.log('Test!');
      return;
    }

    default: 
      console.log('Unknown command: ', cmd, '\nAvailable commands:\n', Object.values(commands));
      return;
  }
} 

main().catch(err => console.log('Error running main', err));
