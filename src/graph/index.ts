import { downloadLeagueIndex, downloadPlayer, downloadPlayerIndex, downloadTeam, downloadImage, downloadTeamIndex, downloadPage } from "./download";

import { runHtmlParser } from "./parsers/html-parser";
import { franchiseParser } from "./parsers/franchise";
import { leagueParser } from "./parsers/league";
import { makePlayerParser } from "./parsers/player";
import { seasonParser } from "./parsers/season";
import { makeTeamParser } from "./parsers/team";
import { makePlayerSeasonParser } from "./parsers/player-season";

import { loadFranchises, loadNBAData, loadPlayers, loadTeams, persistAwards, persistFranchises, persistGraph, persistJSON, persistLeagues, persistPlayers, persistPlayerSeasons, persistMultiWinnerAwards, persistAwardRecipients, persistSeasons, persistTeams } from "./storage";
import { imageDir, spriteColorsPath, spriteMappingPath, spritePath } from "./storage/paths";

import { buildGraph } from "./builder";
import { GRAPH_CONFIG } from "./builder/config";

import { makeDelayedFetch, makeFetch } from "./util/fetch";
import { execSeq } from "./util/promise";
import { createSpriteImage, noopTransform, parseSpriteColorPallette, playerTransform, teamTransform } from "./util/image";
import { NBAType } from "../shared/nba-types";
import { allStarUrl, awardUrls, LEAGUE_CHAMP_URL } from "./util/bref-url";
import { validAllStarSeasons } from "./parsers/awards/all-star";
import { runAwardsParsers } from "./parsers/awards";

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
    ConvertImagesTwo: '--convert-images-two',
    ParsePrimaryColors: '--parse-primary-colors',
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
          return () => downloadImage(fetch, x.image, 'franchise', x.id)
            .catch(err => console.log('Error downloading image... skipping... ', x.id, err));
      });

      return await execSeq(fns);
    }

    case commands.download.TeamImages: {
      const teams  = await loadTeams();

      const fns = teams.map(x => {
          return () => downloadImage(fetch, x.image, 'team', x.id)
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

            return await downloadImage(fetch, x.image, 'player', x.id);
          };
      });

      return await execSeq(fns);
    }

    case commands.download.Awards: {
      const urls = [
        ...Object.values(awardUrls),
        LEAGUE_CHAMP_URL,
      ];
      
      return await execSeq(urls.map(url => {
        return () => downloadPage(delayedFetch, url);
      }));
    }

    case commands.download.AllStar: {
      const allStarUrls = validAllStarSeasons.map(allStarUrl);

      return await execSeq(allStarUrls.map(url => {
        return () => downloadPage(delayedFetch, url);
      }));
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

    case commands.parse.Awards: {
      const {awards, multiWinnerAwards, awardRecipients} = await runAwardsParsers();

      await persistAwards(awards);
      await persistMultiWinnerAwards(multiWinnerAwards);
      return await persistAwardRecipients(awardRecipients);
    }

    // *** graph commands
    case commands.graph.Build: {
      const nbaData = await loadNBAData();

      const graph = await buildGraph(nbaData, GRAPH_CONFIG);

      return await persistGraph(graph);
    }

    // *** misc commands
    case commands.misc.ConvertImages: {
      return await execSeq([
        {typ: 'franchise' as NBAType, transform: teamTransform},
        {typ: 'team' as NBAType, transform: teamTransform},
        {typ: 'player' as NBAType, transform: playerTransform}
      ].map(({typ, transform}) => 
        () => {
          console.log('Building sprite for: ', typ);
          return createSpriteImage(imageDir(typ), spritePath(typ), spriteMappingPath(typ), transform);
        }
      ));
    }
    case commands.misc.ConvertImagesTwo: {
      return await execSeq([
        {typ: 'award' as NBAType, transform: noopTransform},
        {typ: 'league' as NBAType, transform: teamTransform},
      ].map(({typ, transform}) => 
        () => {
          console.log('Building sprite for: ', typ);
          return createSpriteImage(imageDir(typ), spritePath(typ), spriteMappingPath(typ), transform);
        }
      ));
    }

    case commands.misc.ParsePrimaryColors: {
      const types: NBAType[] = ['franchise', 'team', 'award', 'league'];
      return await execSeq(types.map(typ =>
        async () => {
          const colors = await parseSpriteColorPallette(typ);
          return persistJSON(spriteColorsPath(typ))(colors);
        }
      ));
    }

    // for testing, debugging, etc
    case commands.misc.Test: {
      const franchises = await loadFranchises();

      const byName = franchises.sort((a, b) => a.name.length - b.name.length);

      console.log(byName.map(x => x.name));

      // loadGraph
      // loadGraph
      // loadN
      // const res = await Promise.all(
      //   lifetimeAwardParser.map(parser => runHtmlParser(parser))
      // );

      // console.log(res.map(x => x.award));
      // console.log(res.map(x => x.awardRecipients).flat());
      return;
    }

    default: 
      console.log('Unknown command: ', cmd, '\nAvailable commands:\n', Object.values(commands));
      return;
  }
} 

main().catch(err => console.log('Error running main', err));
