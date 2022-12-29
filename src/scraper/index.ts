import { downloadLeagueIndex, downloadPlayer, downloadPlayerIndex, downloadTeam, downloadTeamIndex } from "./download";
import { runExtractor } from "./extract/extractor";
import { FranchiseExtractor } from "./extract/franchise";
import { LeagueExtractor } from "./extract/league";
import { SeasonExtractor } from "./extract/seasons";
import { makeTeamExtractor } from "./extract/team";
import { makeDelayedFetch, makeFetch } from "./util/fetch";
import { execSeq } from "./util/promise";

const VERBOSE_FETCH = true;
const FETCH_DELAY_MS = 6000; // basketball-reference seems to get mad at >~30 req/m

const requireArg = (str: string | undefined, msg: string): string => {
  if (!str) throw new Error(`Additional arguement required for command: ${msg}`);

  return str;
};

const commands = {
  download: {
    LeagueIndex: '--download-league-index',
    TeamIndex: '--download-team-index',
    Team: '--download-team',
    TeamAll: '--download-team-all',
    PlayerIndex: '--download-player-index',
    PlayerIndexAll: '--download-player-index-all',
    Player: '--download-player',
    PlayerAll: '--download-player-all'
  },
  extract: {
    Leagues: '--extract-leagues', // NBA, ABA...
    Seasons: '--extract-seasons', // NBA_2015, ABA_1950
    Franchises: '--extract-franchises', // LAL, MIN...
    Teams: '--extract-teams', // LAL_2015, MIN_2022
    Players: '--extract-players', // James Harden
    PlayerSeasons: '--extract-player-seasons' // James Harden HOU_2015, James Harden BKN_2021
  }
};

// ['a' ... 'z']
const azLowercase: string[] = [...Array(25).keys()].map((x: number) => String.fromCharCode(x + 97));

async function main() {
  const [_, __, cmd, arg] = process.argv;

  const fetch = makeFetch(VERBOSE_FETCH);
  const delayedFetch = makeDelayedFetch(VERBOSE_FETCH, FETCH_DELAY_MS);

  switch (cmd) {
    // *** download commands
    case commands.download.LeagueIndex: return downloadLeagueIndex(fetch);
    case commands.download.TeamIndex: return downloadTeamIndex(fetch);
    case commands.download.Team: return downloadTeam(fetch, requireArg(arg, `${commands.download.Team} <franchise-id>`));
    case commands.download.TeamAll: {
      const franchises = await runExtractor(FranchiseExtractor);

      return execSeq(franchises.map(franchise => {
        return () => downloadTeam(delayedFetch, franchise.id);
      }));
    }
      
    case commands.download.PlayerIndex: return downloadPlayerIndex(fetch, requireArg(arg, `${commands.download.PlayerIndex} <a-z letter>`));
    case commands.download.PlayerIndexAll:
      return execSeq(azLowercase.map(x => {
        return () => downloadPlayerIndex(delayedFetch, x);
      }));

    case commands.download.Player: return downloadPlayer(fetch, requireArg(arg, `${commands.download.Player} <player-id>`));
    // case '--download-player-all': 

    // *** extract commands
    case commands.extract.Leagues: return await runExtractor(LeagueExtractor, { save: true });
    case commands.extract.Seasons: return await runExtractor(SeasonExtractor, { save: true });
    case commands.extract.Franchises: return await runExtractor(FranchiseExtractor, { save: true });
    case commands.extract.Teams: {
      const franchises = await runExtractor(FranchiseExtractor);
      const franchiseIds = franchises.map(x => x.id);

      return execSeq(franchiseIds.map(id => {
        return () => runExtractor(makeTeamExtractor(id), { save: true });
      }));
    }
    // case commands.extract.Players: return await runExtractor(SeasonExtractor, { save: true });
    // case commands.extract.PlayerSeasons: return await runExtractor(FranchiseExtractor, { save: true });

    default: 
      console.log('Unknown command: ', cmd, '\nAvailable commands:\n', Object.values(commands));
      return;
  }
} 

main().catch(err => console.log('Error running main', err));
