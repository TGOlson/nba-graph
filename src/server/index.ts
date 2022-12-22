import { readFranchises, readLeagues, readPlayers, readPlayerTeams, readSeasons, readTeams } from "./cmd/read";
import { writeFranchises, writePlayers, writePlayerTeams, writeSeasonsAndLeagues, writeTeams } from "./cmd/write";
import { makeFetch } from "./util/fetch";

const commandMapping = {
  '--read-seasons': readSeasons,
  '--read-leagues': readLeagues,
  '--read-franchises': readFranchises,
  '--read-teams': readTeams,
  '--read-players': readPlayers,
  '--read-player-teams': readPlayerTeams,

  // Note: currently this is a little brittle as each command needs to be run sequentially (eg. teams expects seasons)
  // This is because it's easy to overload b-ref api with too many calls, at minimum need better error handling
  '--write-seasons': () => writeSeasonsAndLeagues(makeFetch(true)),
  '--write-franchises': () => writeFranchises(makeFetch(true)),
  '--write-teams': () => writeTeams(makeFetch(true)),
  '--write-players': () => writePlayers(makeFetch(true)),
  '--write-player-teams': () => writePlayerTeams(makeFetch(true)),
}

async function main() {
  const [_, __, cmd] = process.argv;

  if (commandMapping[cmd]) {
    const res = await commandMapping[cmd]();
    if (res) console.log(res);
  } else {
    console.log('Unknown command: ', cmd, '\nAvailable commands:\n', Object.keys(commandMapping));
  }
} 

main();
