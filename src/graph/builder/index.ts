import Graph, { DirectedGraph } from "graphology";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";
import Color from "color";

import { NBAData, Team } from "../../shared/nba-types";
import { AwardNodeAttributes, FranchiseNodeAttributes, PlayerNodeAttributes, SpriteNodeAttributes, TeamNodeAttributes } from "../../shared/types";
import { assets } from "../util/assets";
import { GraphConfig } from "./config";
import { loadSpriteColors, loadSpriteMapping } from "../storage";

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

// TODO: should resize player and team default pics to 128x128
const DEFAULT_CROP = {x: 0, y: 0, width: 512, height: 512};
const AWARD_CROP = {x: 0, y: 0, width: 128, height: 128};

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

  const playerYearsActive: {[playerId: string]: number[]} = data.playerSeasons.reduce<{[playerId: string]: number[]}>((acc, {playerId, year}) => {
    const prev = acc[playerId] ?? [];

    prev.push(year);
    acc[playerId] = prev;

    return acc;
  }, {});

  // *************
  // *** NODES ***
  // *************

  data.players.forEach(player => {
    // TODO: more sophisticated size calculation, using seasons, awards, etc.
    const yearsActive = playerYearsActive[player.id];
    if (!yearsActive) throw new Error(`Unexpected error: no years active for player ${player.name}`);
    const size = yearsActive.length < 2 ? config.sizes.playerMin : config.sizes.playerDefault;

    const imgCoords = playerImgLocations[player.id];
    
    const imgProps: SpriteNodeAttributes = imgCoords 
      ? {type: 'sprite', image: assets.img.playerSprite, crop: imgCoords}
      : {type: 'sprite', image: assets.img.playerDefault, crop: DEFAULT_CROP};

    const attrs: PlayerNodeAttributes = {
      size, 
      label: player.name, 
      nbaType: 'player',
      years: `${Math.min(...yearsActive) - 1}-${Math.max(...yearsActive)}`,
      color: config.defaultNodeColor, 
      borderColor: config.defaultBorderColors.player,
      ...imgProps, 
    };

    graph.addNode(player.id, attrs);
  });
  
  data.franchises.forEach(franchise => {
    const imgCoords = franchiseImgLocations[franchise.id];
    
    const imgProps: SpriteNodeAttributes = imgCoords
      ? {type: 'sprite', image: assets.img.franchiseSprite, crop: imgCoords}
      : {type: 'sprite', image: assets.img.teamDefault, crop: DEFAULT_CROP};

    const borderColor = franchiseColors[franchise.id]?.primary ?? config.defaultBorderColors.franchise;
    
    const attrs: FranchiseNodeAttributes = { 
      size: config.sizes.franchise, 
      label: franchise.name, 
      nbaType: 'franchise',
      color: config.defaultNodeColor, 
      borderColor,
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
      imgProps = {type: 'sprite', image: assets.img.teamDefault, crop: DEFAULT_CROP};
    }
  
    const borderColor = teamColors[team.id]?.primary ?? config.defaultBorderColors.team;

    const attrs: TeamNodeAttributes = { 
      size: config.sizes.team, 
      label, 
      nbaType: 'team',
      color: config.defaultNodeColor, 
      borderColor,
      ...imgProps,
    };

    graph.addNode(team.id, attrs);
  });

  data.awards.forEach(award => {
    const imgProps: SpriteNodeAttributes = {type: 'sprite', image: award.image, crop: AWARD_CROP};

    const attrs: AwardNodeAttributes = {
      label: award.name,
      nbaType: 'award',
      color: '#ffffff',
      borderColor: '#000000',
      size: 3,
      ...imgProps,
    };

    graph.addNode(award.id, attrs);
  });

  data.multiWinnerAwards.forEach(award => {
    const imgProps: SpriteNodeAttributes = {type: 'sprite', image: award.image, crop: AWARD_CROP};
    
    const attrs: AwardNodeAttributes = {
      label: award.name,
      nbaType: 'award',
      color: '#ffffff',
      borderColor: '#000000',
      size: 3,
      ...imgProps,
    };
    
    graph.addNode(award.id, attrs);
  });

  // *************
  // *** EDGES ***
  // *************

  data.playerSeasons.forEach(pt => {
    // graph.addEdge(pt.playerId, pt.teamId, {label: 'played_on'});

    const teamPalette = teamColors[pt.teamId];
  
    const color = teamPalette
      ? Color(teamPalette.primary).lighten(0.3).hex()
      : config.defaultEdgeColor;

    graph.addEdge(pt.playerId, pt.teamId, {color});
  });

  teams.forEach(team => {
    // graph.addEdge(team.id, team.franchiseId, {label: 'season_of'});
  
    const teamPalette = teamColors[team.id];
  
    const color = teamPalette
      ? Color(teamPalette.primary).lighten(0.3).hex()
      : config.defaultEdgeColor;

    graph.addEdge(team.id, team.franchiseId, {color});
  });

  data.multiWinnerAwards.forEach(seasonAward => {
    graph.addEdge(seasonAward.awardId, seasonAward.id, {color: config.defaultEdgeColor});
  });

  data.awardRecipients.forEach(recipient => {
    // Need to check for dupdes because of how the data is modeled for single-winner awards
    // eg. for MVP winners we just make an edge between player->NBA>MVP, without distinguishing between the years
    // for guys who have won an MVP multiple times, this would create a duplicate edge
    // in the future maybe it would be nice to add a weight to the edge to distinguish between multiple wins
    // (or add an edge label, but that isn't used elsewhere and I think would be too busy)
    if (!graph.hasEdge(recipient.recipientId, recipient.awardId)) {
      graph.addEdge(recipient.recipientId, recipient.awardId, {color: config.defaultEdgeColor});
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
