import { readFranchises, readLeagues, readPlayers, readPlayerTeams, readSeasons, readTeams } from "./cmd/read";
import { writeFranchises, writePlayers, writePlayerTeams, writeSeasonsAndLeagues, writeTeams } from "./cmd/write";
import { Fetch, makeDelayedFetch, makeFetch } from "./util/fetch";

type Reader<T> = () => Promise<T>;
type Writer = (Fetch) => Promise<void>;

const readers: {[key: string]: Reader<any> } = {
  '--read-seasons': readSeasons,
  '--read-leagues': readLeagues,
  '--read-franchises': readFranchises,
  '--read-teams': readTeams,
  '--read-players': readPlayers,
  '--read-player-teams': readPlayerTeams,
}

const writers: {[key: string]: Writer} = {
  // Note: currently this is a little brittle as each command needs to be run sequentially (eg. teams expects seasons)
  // This is because it's easy to overload b-ref api with too many calls, so it's left to the user to call as needed
  // TODO: needs better error handling, at least
  '--write-seasons': writeSeasonsAndLeagues,
  '--write-franchises': writeFranchises,
  '--write-teams': writeTeams,
  '--write-players': writePlayers,
  '--write-player-teams': writePlayerTeams,
}

async function main() {
  const [_, __, cmd] = process.argv;
  if (readers[cmd]) {
    const res: any = await readers[cmd]();
    console.log(res);
  } else if (writers[cmd]) {
    const fetch = makeDelayedFetch(true, 100);
    await writers[cmd](fetch);
  } else {
    console.log('Unknown command: ', cmd, '\nAvailable commands:\n', Object.keys(readers), Object.keys(writers));
  }
} 

main();
