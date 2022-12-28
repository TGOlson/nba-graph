import { downloadLeagueIndex, downloadPlayer, downloadPlayerIndex, downloadTeam, downloadTeamIndex } from "./download";
import { extractFranchises } from "./extract/franchise";
import { makeDelayedFetch, makeFetch } from "./util/fetch";
import { execSeq } from "./util/promise";

const VERBOSE_FETCH = true;
const FETCH_DELAY_MS = 3000; // basketball-reference seems to get mad at >~30 req/m

const requireArg = (str: string | undefined, msg: string): string => {
  if (!str) throw new Error(`Additional arguement required for command: ${msg}`);

  return str;
};

const commands = {
  DownloadLeagueIndex: '--download-league-index',
  DownloadTeamIndex: '--download-team-index',
  DownloadTeam: '--download-team',
  DownloadTeamsAll: '--download-seasons-all',
  DownloadPlayerIndex: '--download-player-index',
  DownloadPlayerIndexAll: '--download-player-index-all',
  DownloadPlayer: '--download-player',
  DownloadPlayerAll: '--download-player-all'
};

// ['a' ... 'z']
const azLowercase: string[] = [...Array(25).keys()].map((x: number) => String.fromCharCode(x + 97));

async function main() {
  const [_, __, cmd, arg] = process.argv;

  const fetch = makeFetch(VERBOSE_FETCH);
  const delayedFetch = makeDelayedFetch(VERBOSE_FETCH, FETCH_DELAY_MS);

  switch (cmd) {
    case commands.DownloadLeagueIndex: 
      return downloadLeagueIndex(fetch);
    case commands.DownloadTeamIndex: 
      return downloadTeamIndex(fetch);
    case commands.DownloadTeam: 
      return downloadTeam(fetch, requireArg(arg, `${commands.DownloadTeam} <franchise-id>`));
    case commands.DownloadTeamsAll: 
      const franchises = await extractFranchises();

      return execSeq(franchises.map(franchise => {
        return () => downloadTeam(delayedFetch, franchise.id);
      }));
      
    case commands.DownloadPlayerIndex: 
      return downloadPlayerIndex(fetch, requireArg(arg, `${commands.DownloadPlayerIndex} <a-z letter>`));
    case commands.DownloadPlayerIndexAll:
      return execSeq(azLowercase.map(x => {
        return () => downloadPlayerIndex(delayedFetch, x);
      }));

    case commands.DownloadPlayer: 
      return downloadPlayer(fetch, requireArg(arg, `${commands.DownloadPlayer} <player-id>`));
    // case '--download-player-all': 

    default: 
      console.log('Unknown command: ', cmd, '\nAvailable commands:\n', Object.values(commands));
      return;
  }
} 

main().catch(err => console.log('Error running main', err));
