import { 
  downloadLeagueIndex, downloadPlayer, downloadPlayerIndex, downloadTeam, 
  downloadTeamIndex, downloadTeamAll, downloadPlayerIndexAll, downloadPlayerGroup, 
  downloadPlayerAll, downloadFranchiseImages, downloadTeamImages, downloadPlayerImages, 
  downloadAwards, downloadAllStar 
} from "./commands/download";

import { parseAwards, parseFranchises, parseLeagues, parsePlayers, parseSeasons, parseTeams } from "./commands/parse";

import * as storage from "./storage";
import { imageDir, imgPath, spriteColorsPath, spriteMappingPath, spritePath } from "./storage/paths";

import { buildGraph } from "./builder";
import { GRAPH_CONFIG } from "./builder/config";

import { makeDelayedFetch, makeFetch } from "./util/fetch";
import { execSeq } from "./util/promise";
import { createSpriteImage, parseSpriteColorPallette, playerTransform, teamTransform } from "./util/image";
import path from "path";
import { readdir } from "fs/promises";
import Jimp from "jimp";
import { bidirectional } from "graphology-shortest-path";

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
    PlayerImages: '--download-player-images',
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
  misc: {
    ConvertImages: '--convert-images',
    // ConvertImagesTwo: '--convert-images-two',
    ParsePrimaryColors: '--parse-primary-colors',
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
    case commands.download.PlayerAll: return downloadPlayerAll(delayedFetch);

    case commands.download.FranchiseImages: return downloadFranchiseImages(fetch);
    case commands.download.TeamImages: return downloadTeamImages(fetch);
    case commands.download.PlayerImages: return downloadPlayerImages(fetch, arg);

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
    case commands.graph.Build: {
      const nbaData = await storage.loadNBAData();

      const graph = await buildGraph(nbaData, GRAPH_CONFIG);

      return await storage.persistGraph(graph);
    }

    // *** misc commands
    case commands.misc.ConvertImages: {
      const readDirPaths = (dir: string): Promise<string[]> => {
        return readdir(dir).then(filenames => filenames.map(filename => path.resolve(dir, filename)));
      };

      const playerPaths = await readDirPaths(imageDir('player'));
      const n = playerPaths.length;
      const playerPaths0 = playerPaths.slice(0, n / 2);
      const playerPaths1 = playerPaths.slice(n / 2, n);

      const otherPaths = (await Promise.all([
        readDirPaths(imageDir('team')),
        readDirPaths(imageDir('franchise')),
        readDirPaths(imageDir('award')),
        readDirPaths(imageDir('league')),
        [
          imgPath(null, 'player_default', 'png'),
          imgPath(null, 'team_default', 'png'),
        ]
      ])).flat();
      
      const otherTransform = (key: string, image: Jimp): Jimp => {
        // Super hacky, but doesn't feel worth it to refactor transform scheme now...
        // Basically use team transform for all 3 letter keys (with or without trailing years) that aren't NBA, ABA, or BAA
        // We want to apploy this to all team and franchise images, and nothing else...
        return key.match(/(?!NBA|ABA|BAA)[A-Z]{3}/) ? teamTransform(key, image) : image;
      };

      return Promise.all([
        {paths: playerPaths0, transform: playerTransform, dedupe: false},
        {paths: playerPaths1, transform: playerTransform, dedupe: false},
        {paths: otherPaths, transform: otherTransform, dedupe: true},
      ].map(({paths, transform, dedupe}, index) => {
        const key = `sprite_${index}`;
        return createSpriteImage(paths, spritePath(key), spriteMappingPath(key), transform, dedupe);
      }));
    }

    case commands.misc.ParsePrimaryColors: {
      const spriteIds = await storage.loadSpriteIds();

      return await execSeq(spriteIds.map(spriteId =>
        async () => {
          const colors = await parseSpriteColorPallette(spriteId);
          return storage.persistJSON(spriteColorsPath(spriteId))(colors);
        }
      ));
    }

    // for testing, debugging, etc
    case commands.misc.Test: {
      const nbaData = await storage.loadNBAData();
      const graph = await buildGraph(nbaData, GRAPH_CONFIG);
      const graph2 = graph.copy();
      // graph.remove

      graph2.forEachNode((node) => {
        const attrs = graph2.getNodeAttributes(node);

        if (attrs.nbaType === 'player' || attrs.nbaType === 'team') {
          // attrs.hidden = true;
        } else {
          graph2.dropNode(node);
        }

        // return attrs;
      });

      // const path = bidirectional(graph2, 'NBA', 'ABA');
      const path = bidirectional(graph2, 'curryst01', 'ervinju01');

      // result
      // [
      //   'curryst01', 'GSW_2010',
      //   'bellra01',  'PHI_2001',
      //   'hillty01',  'CLE_1995',
      //   'coltest01', 'PHI_1987',
      //   'ervinju01'
      // ]

      console.log(path);
      console.log(graph.edge('GSW_2010', 'curryst01'));


      return;
    }

    default: 
      console.log('Unknown command: ', cmd, '\nAvailable commands:\n', Object.values(commands));
      return;
  }
} 

main().catch(err => console.log('Error running main', err));
