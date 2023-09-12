import Graph, { DirectedGraph } from "graphology";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";
import Color from "color";

import { Award, NBAData, Season, Team } from "../../shared/nba-types";
import { NodeAttributes, SpriteNodeAttributes } from "../../shared/types";
import { assets } from "../util/assets";
import { GraphConfig } from "./config";
import { loadSpriteColors, loadSpriteMapping } from "../storage";
import { notNull } from "../../shared/util";

// TODO: things that would be nice to add (that we already have the data for, but need to stitch together):
// - years active for players
// - leagues active for players
// - leagues for teams (and franchises)

// mainly thinking for dropdown search:
// eg.
// [pic] Steph Curry
//       2013-present / NBA
// [pic] Denver Nuggets (franchise)
//       1976-1982 / ABA
// [pic] Denver Nuggets (franchise)
//       1985-present / NBA

const AWARD_IMAGE_CROP = {x: 0, y: 0, width: 200, height: 200};
const DEFAULT_IMAGE_CROP = {x: 0, y: 0, width: 128, height: 128};

export const buildGraph = async (data: NBAData, config: GraphConfig): Promise<Graph> => {
  console.log('Building graph');
  const graph = new DirectedGraph();

  const startYear = config.startYear ?? 0; 
  const endYear = config.endYear ?? Infinity;
  const teams: Team[] = data.teams.filter(({year}) => year >= startYear && year <= endYear);

  const playerImgLocations = await loadSpriteMapping('player');
  const teamImgLocations = await loadSpriteMapping('team');
  const franchiseImgLocations = await loadSpriteMapping('franchise');

  const teamColors = await loadSpriteColors('team');
  const franchiseColors = await loadSpriteColors('franchise');

  const seasonsById = data.seasons.reduce<{[id: string]: Season}>((acc, season) => {
    acc[season.id] = season;
    return acc;
  }, {});

  const teamsById = data.teams.reduce<{[id: string]: Team}>((acc, team) => {
    acc[team.id] = team;
    return acc;
  }, {});

  const awardsById = data.awards.reduce<{[id: string]: Award}>((acc, award) => {
    acc[award.id] = award;
    return acc;
  }, {});

  const playerSeasons: {[playerId: string]: Season[]} = data.playerSeasons.reduce<{[playerId: string]: Season[]}>((acc, ps) => {
    const prev = acc[ps.playerId] ?? [];

    const team = teamsById[ps.teamId];
    if (!team) throw new Error(`Unexpected error: no team for player ${ps.playerId} ${ps.year}`);

    const season = seasonsById[team.seasonId];
    if (!season) throw new Error(`Unexpected error: no season for player ${ps.playerId} ${ps.year}`);

    prev.push(season);
    acc[ps.playerId] = prev;

    return acc;
  }, {});

  // *************
  // *** NODES ***
  // *************

  data.players.forEach(player => {
    // TODO: more sophisticated size calculation, using seasons, awards, etc.
    const seasons = playerSeasons[player.id];
    if (!seasons) throw new Error(`Unexpected error: no years active for player ${player.name}`);
    const yearsAll = seasons.map(x => x.year).sort();
    const years = [...new Set(yearsAll)];
    const end = years[years.length - 1];

    const size = (years.length <= 3 && end !== 2023) ? config.sizes.playerMin : config.sizes.playerDefault;

    const imgCoords = playerImgLocations[player.id];

    const leagues = seasons.map(season => season.leagueId);
    const leagueIds = [...new Set(leagues)];
    
    const imgProps: SpriteNodeAttributes = imgCoords 
      ? {type: 'sprite', image: assets.img.playerSprite, crop: imgCoords}
      : {type: 'sprite', image: assets.img.playerDefault, crop: DEFAULT_IMAGE_CROP};

    const attrs: NodeAttributes = {
      nbaType: 'player',
      label: player.name, 
      size, 
      years,
      color: config.nodeColors.default, 
      borderColor: config.borderColors.player,
      leagues: leagueIds,
      ...imgProps, 
    };

    graph.addNode(player.id, attrs);
  });
  
  data.franchises.forEach(franchise => {
    const imgCoords = franchiseImgLocations[franchise.id];
    
    const imgProps: SpriteNodeAttributes = imgCoords
      ? {type: 'sprite', image: assets.img.franchiseSprite, crop: imgCoords}
      : {type: 'sprite', image: assets.img.teamDefault, crop: DEFAULT_IMAGE_CROP};

    const borderColor = franchiseColors[franchise.id]?.primary ?? config.borderColors.franchise;
    
    const franchiseTeams = teams.filter(team => team.franchiseId === franchise.id);
    const years = franchiseTeams.map(team => team.year).sort();
    const leagues = franchiseTeams.map(team => seasonsById[team.seasonId]?.leagueId).filter(notNull);
    const leagueIds = [...new Set(leagues)];

    const attrs: NodeAttributes = { 
      nbaType: 'franchise',
      label: franchise.name, 
      size: config.sizes.franchise, 
      color: config.nodeColors.default, 
      borderColor,
      leagues: leagueIds,
      years,
      ...imgProps, 
    };

    graph.addNode(franchise.id, attrs);
  });


  teams.forEach(team => {
    // 2023 => 2022-23
    const label = `${team.name} (${team.year - 1}-${team.year.toString().slice(2)})`;

    const imgCoords = teamImgLocations[team.id];
    const fallbackImgCoords = franchiseImgLocations[team.franchiseId];
    
    let imgProps: SpriteNodeAttributes | null = null;

    if (imgCoords) {
      imgProps = {type: 'sprite', image: assets.img.teamSprite, crop: imgCoords};
    } else if (fallbackImgCoords) {
      imgProps = {type: 'sprite', image: assets.img.franchiseSprite, crop: fallbackImgCoords};
    } else {
      imgProps = {type: 'sprite', image: assets.img.teamDefault, crop: DEFAULT_IMAGE_CROP};
    }
  
    const borderColor = teamColors[team.id]?.primary ?? config.borderColors.team;

    const leagueId = seasonsById[team.seasonId]?.leagueId;

    if (!leagueId) throw new Error(`Unexpected error: no leagueId for team ${team.name} ${team.year}`);

    const attrs: NodeAttributes = { 
      nbaType: 'team',
      label, 
      size: config.sizes.team, 
      color: config.nodeColors.default, 
      borderColor,
      leagues: [leagueId],
      years: [team.year],
      ...imgProps,
    };

    graph.addNode(team.id, attrs);
  });

  data.awards.forEach(award => {
    const multiWinner = data.multiWinnerAwards.filter(x => x.awardId === award.id);
    const recipients = data.awardRecipients.filter(x => x.awardId === award.id);

    const potentialYearsAll = [...multiWinner, ...recipients].map(x => x.year).filter(notNull).sort();

    let years = [...new Set(potentialYearsAll)];
    let leagues = [award.leagueId];
    
    // this will be the case for lifetime awards that don't have years
    // in this case just use the cumulative career years of all the recipients
    if (years.length === 0) {
      const recipientSeasons = recipients.map(x => playerSeasons[x.recipientId]).flat().filter(notNull);
      const recipientYears = recipientSeasons.map(x => x.year).sort();
      years = [...new Set(recipientYears)];

      // also kind of hacky, but for lifetime awards just use the cumulative leagues of all the recipients
      // other awards know their league at parse time, but lifetime awards don't have easy access to that info
      leagues = [...new Set(recipientSeasons.map(x => x.leagueId))];
    }

    const attrs: NodeAttributes = {
      nbaType: 'award',
      label: award.name,
      color: config.nodeColors.award,
      borderColor: config.borderColors.award,
      size: config.sizes.awardMax, // TODO: maybe filter by mvp, hof for max, others are default size?
      type: 'sprite',
      image: award.image,
      leagues,
      years,
      crop: AWARD_IMAGE_CROP
    };

    graph.addNode(award.id, attrs);
  });

  data.multiWinnerAwards.forEach(award => {
    const baseAward = awardsById[award.awardId];
    if (!baseAward) throw new Error(`Unexpected error: no base award for multi-winner award ${award.name}`);

    const leagueId = baseAward.leagueId;

    const attrs: NodeAttributes = {
      nbaType: 'award',
      label: award.name,
      color: config.nodeColors.award,
      borderColor: config.borderColors.award,
      size: config.sizes.awardDefault,
      type: 'sprite',
      image: award.image,
      leagues: [leagueId],
      years: [award.year],
      crop: AWARD_IMAGE_CROP
    };
    
    graph.addNode(award.id, attrs);
  });

  // *************
  // *** EDGES ***
  // *************

  data.playerSeasons.forEach(pt => {
    const teamPalette = teamColors[pt.teamId];
  
    const color = teamPalette
      ? Color(teamPalette.primary).lighten(0.3).hex()
      : config.edgeColors.default;

    graph.addEdge(pt.playerId, pt.teamId, {color, hidden: true});
  });

  teams.forEach(team => {
    const teamPalette = teamColors[team.id];
  
    const color = teamPalette
      ? Color(teamPalette.primary).lighten(0.3).hex()
      : config.edgeColors.default;

    graph.addEdge(team.id, team.franchiseId, {color, hidden: true});
  });

  data.multiWinnerAwards.forEach(seasonAward => {
    graph.addEdge(seasonAward.awardId, seasonAward.id, {color: config.edgeColors.award, hidden: true});
  });

  data.awardRecipients.forEach(recipient => {
    // Need to check for dupdes because of how the data is modeled for single-winner awards
    // eg. for MVP winners we just make an edge between player->NBA>MVP, without distinguishing between the years
    // for guys who have won an MVP multiple times, this would create a duplicate edge
    // in the future maybe it would be nice to add a weight to the edge to distinguish between multiple wins
    // (or add an edge label, but that isn't used elsewhere and I think would be too busy)
    if (!graph.hasEdge(recipient.recipientId, recipient.awardId)) {
      graph.addEdge(recipient.recipientId, recipient.awardId, {color: config.edgeColors.award, hidden: true, year: recipient.year, nbaType: 'award'});
    }
  });

  console.log('Assigning locations');
  circular.assign(graph);

  // This call takes a little while...
  const settings = forceAtlas2.inferSettings(graph);
  console.log('infered settings', forceAtlas2.inferSettings(graph));
  // => 
  // const settings = {
  //   barnesHutOptimize: true,
  //   strongGravityMode: true,
  //   gravity: 0.05,
  //   scalingRatio: 10,
  //   slowDown: 9.031385330625534
  // };


  forceAtlas2.assign(graph, {
    iterations: 100,
    settings,
  });

  console.log('Done!');
  return graph;
};
