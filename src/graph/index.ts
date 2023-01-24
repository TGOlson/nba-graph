import { downloadLeagueIndex, downloadPlayer, downloadPlayerIndex, downloadTeam, downloadImage, downloadTeamIndex } from "./download";

import { runHtmlParser } from "./parsers/html-parser";
import { franchiseParser } from "./parsers/franchise";
import { leagueParser } from "./parsers/league";
import { makePlayerParser } from "./parsers/player";
import { seasonParser } from "./parsers/season";
import { makeTeamParser } from "./parsers/team";
import { makePlayerSeasonParser } from "./parsers/player-season";

import { loadNBAData, loadSpriteMapping, persistFranchises, persistGraph, persistLeagues, persistPlayers, persistPlayerSeasons, persistSeasons, persistTeams } from "./storage";
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
    Team: '--download-team',
    TeamAll: '--download-team-all',
    PlayerIndex: '--download-player-index',
    PlayerIndexAll: '--download-player-index-all',
    Player: '--download-player',
    PlayerGroup: '--download-player-group',
    PlayerAll: '--download-player-all',
    FranchiseLogos: '--download-franchise-logos',
    TeamLogos: '--download-team-logos'
  },
  parse: {
    Leagues: '--parse-leagues', // NBA, ABA...
    Seasons: '--parse-seasons', // NBA_2015, ABA_1950
    Franchises: '--parse-franchises', // LAL, MIN...
    Teams: '--parse-teams', // LAL_2015, MIN_2022
    Players: '--parse-players', // James Harden
    PlayerSeasons: '--parse-player-seasons' // James Harden HOU_2015, James Harden BKN_2021
  },
  misc: {
    ConvertImages: '--convert-images',
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

    case commands.download.FranchiseLogos: {
      const franchises = await runHtmlParser(franchiseParser);
      const fns = franchises.map(x => {
          return () => downloadImage(fetch, x.image, NBAType.FRANCHISE, x.id)
            .catch(err => console.log('Error download image for. Skipping ', x.id, err));
      });

      return await execSeq(fns);
    }

    case commands.download.TeamLogos: {
      const franchises = await runHtmlParser(franchiseParser);
      const franchiseIds = franchises.map(x => x.id);

      const teams = await Promise.all(
        franchiseIds.map(id => runHtmlParser(makeTeamParser(id)))
      ).then(xs => xs.flat());

      const fns = teams.map(x => {
          return () => downloadImage(fetch, x.image, NBAType.TEAM, x.id)
            .catch(err => console.log('Error download image for. Skipping ', x.id, err));
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
      const players = await Promise.all(
        azLowercase.map(x => runHtmlParser(makePlayerParser(x)))
      ).then(xs => xs.flat());

      return await persistPlayers(players);
    }

    case commands.parse.PlayerSeasons: {
      const players = await Promise.all(
        azLowercase.map(x => runHtmlParser(makePlayerParser(x)))
      ).then(xs => xs.flat());

      const playerIds = players.map(x => x.id);

      const playerSeasons = await Promise.all(
        playerIds.map(id => runHtmlParser(makePlayerSeasonParser(id)))
      ).then(xs => xs.flat());

      return await persistPlayerSeasons(playerSeasons);
    }

    // *** graph commands
    case commands.graph.Build: {
      const nbaData = await loadNBAData();

      const teamLocationMappings = await loadSpriteMapping(NBAType.TEAM);
      const franchiseLocationMappings = await loadSpriteMapping(NBAType.FRANCHISE);
      const graph = buildGraph(nbaData, GRAPH_CONFIG, [
        {typ: NBAType.TEAM, map: teamLocationMappings},
        {typ: NBAType.FRANCHISE, map: franchiseLocationMappings}
      ]);

      return await persistGraph(graph);
    }

    // *** misc commands
    case commands.misc.ConvertImages: {
      // const typ = NBAType.FRANCHISE;
      const typ = NBAType.TEAM;
      
      const imagePath = spritePath(typ);
      const imagePathMuted = spritePath(typ, true);
      const mappingPath = spriteMappingPath(typ);
      
      await createSpriteImage(imageDir(typ), imagePath, mappingPath);
      return await convertToBW(imagePath, imagePathMuted);
    }

    default: 
      console.log('Unknown command: ', cmd, '\nAvailable commands:\n', Object.values(commands));
      return;
  }
} 

main().catch(err => console.log('Error running main', err));
