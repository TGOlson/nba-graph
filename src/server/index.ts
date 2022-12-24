import { PLAYER_PATH } from "./cmd/path";
import { readFranchises, readLeagues, readPlayers, readPlayerTeams, readSeasons, readTeams } from "./cmd/read";
import { dedupe, writeFranchises, writeJSON, writePlayers, writePlayerTeams, writeSeasonsAndLeagues, writeTeams } from "./cmd/write";

import { Franchise, League, Player, PlayerTeam, Season, Team } from '../shared/nba-types';
import { Fetch, makeDelayedFetch } from "./util/fetch";

type Reader<T> = () => Promise<T>;
type Writer = (fetch: Fetch) => Promise<void>;

const VERBOSE_FETCH = true;
const FETCH_DELAY_MS = 2500; // basketball-reference seems to get mad at >30 req/m

// TODO: can this be cleaned up by using some "Serializable" property on all types?
type ReaderOutput = League[] | Season[] | Franchise[] | Team[] | Player[] | PlayerTeam[];

const readers: Record<string, Reader<ReaderOutput>> = {
  '--read-seasons': readSeasons,
  '--read-leagues': readLeagues,
  '--read-franchises': readFranchises,
  '--read-teams': readTeams, 
  '--read-players': readPlayers, 
  '--read-player-teams': readPlayerTeams,
};

const getReader = (str: string): Reader<ReaderOutput> | null => readers[str];

const writers: Record<string, Writer> = {
  // Note: currently this is a little brittle as each command needs to be run sequentially (eg. teams expects seasons)
  // This is because it's easy to overload b-ref api with too many calls, so it's left to the user to call as needed
  // TODO: needs better error handling, at least
  '--write-seasons': writeSeasonsAndLeagues, // 1 request
  '--write-franchises': writeFranchises,     // 1 request, 50 results
  '--write-teams': writeTeams,               // 50 requests, ~1500 results
  '--write-players': writePlayers,           // ~1500 requests, ?? results
  '--write-player-teams': writePlayerTeams,  // ??
};

const getWriter = (str: string): Writer | null => writers[str];

async function main() {
  const [_, __, cmd] = process.argv;

  const reader = getReader(cmd);
  const writer = getWriter(cmd);
  
  if (reader) {
    const res: ReaderOutput = await reader();
    console.log(res);
  } else if (writer) {
    const fetch = makeDelayedFetch(VERBOSE_FETCH, FETCH_DELAY_MS);
    await writer(fetch);
  
  // One time cleanup command
  } else if (cmd === '--dedupe-players') {
    const players = await readPlayers();
    const dedupedPlayers = dedupe(players);

    console.log('Initial player count: ', players.length);
    console.log('Deduped player count: ', dedupedPlayers.length);

    await writeJSON(PLAYER_PATH, dedupedPlayers);
  } else {
    console.log('Unknown command: ', cmd, '\nAvailable commands:\n', Object.keys(readers), Object.keys(writers));
  }
} 

main().catch(err => console.log('Error running main', err));
