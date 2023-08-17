import { downloadLeagueIndex, downloadPlayer, downloadPlayerIndex, downloadTeam, downloadImage, downloadTeamIndex } from "./download";

import { runHtmlParser } from "./parsers/html-parser";
import { franchiseParser } from "./parsers/franchise";
import { leagueParser } from "./parsers/league";
import { makePlayerParser } from "./parsers/player";
import { seasonParser } from "./parsers/season";
import { makeTeamParser } from "./parsers/team";
import { makePlayerSeasonParser } from "./parsers/player-season";

import { loadFranchises, loadNBAData, loadPlayers, loadSpriteMapping, loadTeams, persistFranchises, persistGraph, persistLeagues, persistPlayers, persistPlayerSeasons, persistSeasons, persistTeams } from "./storage";
import { imageDir, spriteMappingPath, spritePath } from "./storage/paths";

import { buildGraph } from "./builder";
import { GRAPH_CONFIG } from "./builder/config";

import { makeDelayedFetch, makeFetch } from "./util/fetch";
import { execSeq } from "./util/promise";
import { convertToBW, createSpriteImage } from "./util/image";
import { NBAType } from "../shared/nba-types";

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
    Team: '--download-team', // <team-id>
    TeamAll: '--download-team-all',
    PlayerIndex: '--download-player-index', // <a-z letter>
    PlayerIndexAll: '--download-player-index-all',
    Player: '--download-player', // <player-id>
    PlayerGroup: '--download-player-group', // <letter>
    PlayerAll: '--download-player-all',
    FranchiseImages: '--download-franchise-images',
    TeamImages: '--download-team-images',
    PlayerImages: '--download-player-images'
  },
  parse: {
    Leagues: '--parse-leagues', // NBA, ABA...
    Seasons: '--parse-seasons', // NBA_2015, ABA_1950
    Franchises: '--parse-franchises', // LAL, MIN...
    Teams: '--parse-teams', // LAL_2015, MIN_2022
    Players: '--parse-players', // James Harden + each season
  },
  misc: {
    ConvertImages: '--convert-images',
    Test: '--test',
  },
  graph: {
    Build: '--build-graph'
  }
};

// ['a' ... 'z']
const azLowercase: string[] = [...Array(26).keys()].map((x: number) => String.fromCharCode(x + 97));

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
      const franchises = await runHtmlParser(franchiseParser);

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
    case commands.download.PlayerGroup: {
      const section = requireArg(arg, `${commands.download.PlayerGroup} <letter>`);
      const players = await runHtmlParser(makePlayerParser(section));
      const playerIds = players.map(x => x.id);

      return execSeq(playerIds.map(id => {
        return () => downloadPlayer(delayedFetch, id);
      }));
    }
    case commands.download.PlayerAll: {
      const players = await Promise.all(
        azLowercase.map(x => runHtmlParser(makePlayerParser(x)))
      ).then(x => x.flat());

      const playerIds = players.map(x => x.id);

      return execSeq(playerIds.map(id => {
        return () => downloadPlayer(delayedFetch, id);
      }));
    }

    case commands.download.FranchiseImages: {
      const franchises = await loadFranchises();

      const fns = franchises.map(x => {
          return () => downloadImage(fetch, x.image, NBAType.FRANCHISE, x.id)
            .catch(err => console.log('Error downloading image... skipping... ', x.id, err));
      });

      return await execSeq(fns);
    }

    case commands.download.TeamImages: {
      const teams  = await loadTeams();

      const fns = teams.map(x => {
          return () => downloadImage(fetch, x.image, NBAType.TEAM, x.id)
            .catch(err => console.log('Error download image for. Skipping ', x.id, err));
      });

      return await execSeq(fns);
    }

    case commands.download.PlayerImages: {
      const players = await loadPlayers();

      const startAtId = arg;
      const startAt = startAtId ? players.findIndex(x => x.id == startAtId) : 0;

      const fns = players.slice(startAt, players.length).map((x, i) => {
          return async () => {
            console.log(`[${i + startAt} of ${players.length}]: Fetching image for: ${x.id}`);

            if (!x.image) {
              console.log('No image found for player, skipping...', x.id);
              return;
            }

            return await downloadImage(fetch, x.image, NBAType.PLAYER, x.id);
          };
      });

      return await execSeq(fns);
    }

    // *** extract commands
    case commands.parse.Leagues: return await runHtmlParser(leagueParser).then(persistLeagues);
    case commands.parse.Seasons: return await runHtmlParser(seasonParser).then(persistSeasons);
    case commands.parse.Franchises: return await runHtmlParser(franchiseParser).then(persistFranchises);
    case commands.parse.Teams: {
      const franchises = await runHtmlParser(franchiseParser);
      const franchiseIds = franchises.map(x => x.id);

      const teams = await Promise.all(
        franchiseIds.map(id => runHtmlParser(makeTeamParser(id)))
      ).then(xs => xs.flat());
      
      return await persistTeams(teams);
    }

    case commands.parse.Players: {
      const partialPlayers = await Promise.all(
        azLowercase.map(x => runHtmlParser(makePlayerParser(x)))
      ).then(xs => xs.flat());

      const res = await Promise.all(
        partialPlayers.map(player => runHtmlParser(makePlayerSeasonParser(player)))
      );

      const players = res.map(x => x.player);
      const playerSeasons = res.map(x => x.seasons).flat();

      await persistPlayers(players);
      return await persistPlayerSeasons(playerSeasons);
    }

    // *** graph commands
    case commands.graph.Build: {
      const nbaData = await loadNBAData();

      const franchiseLocationMappings = await loadSpriteMapping(NBAType.FRANCHISE);
      const teamLocationMappings = await loadSpriteMapping(NBAType.TEAM);
      const playerLocationMappings = await loadSpriteMapping(NBAType.PLAYER);
      const graph = buildGraph(nbaData, GRAPH_CONFIG, [
        {typ: NBAType.FRANCHISE, map: franchiseLocationMappings},
        {typ: NBAType.TEAM, map: teamLocationMappings},
        {typ: NBAType.PLAYER, map: playerLocationMappings}
      ]);

      return await persistGraph(graph);
    }

    // *** misc commands
    case commands.misc.ConvertImages: {
      return await Promise.all([
        NBAType.FRANCHISE,
        NBAType.TEAM,
        NBAType.PLAYER
      ].map(async (typ) => {
        const imagePath = spritePath(typ);
        const imagePathMuted = spritePath(typ, true);
        const mappingPath = spriteMappingPath(typ);
        
        console.log('building sprite for', typ);
        await createSpriteImage(imageDir(typ), imagePath, mappingPath);
        console.log('converting to black and white for ', typ);
        return await convertToBW(imagePath, imagePathMuted);
      }));
    }

    // for testing, debugging, etc
    case commands.misc.Test: {
      const players = await loadPlayers();

      const playersWithImage = players.filter(x => x.image);
      const playersWithSeasons = players.filter(x => x.seasons > 2);
      const playersWithImageAndSeasons = players.filter(x => x.seasons > 2 && x.image);
      const playersWithAwards = players.filter(x => x.awards.length > 1);

      console.log('players', players.length);
      console.log('playersWithImage', playersWithImage.length);
      console.log('playersWithSeasons', playersWithSeasons.length);
      console.log('playersWithImageAndSeasons', playersWithImageAndSeasons.length);
      console.log('playersWithAwards', playersWithAwards.length);

      return;
    }

    default: 
      console.log('Unknown command: ', cmd, '\nAvailable commands:\n', Object.values(commands));
      return;
  }
} 

main().catch(err => console.log('Error running main', err));
