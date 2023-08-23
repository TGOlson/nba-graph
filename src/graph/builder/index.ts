import Graph, { DirectedGraph } from "graphology";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";

import { Franchise, NBAData, NBAType, Team } from "../../shared/nba-types";
import { EmptyObject, FranchiseNodeAttributes, PlayerNodeAttributes, SelectionMap, SpriteNodeAttributes, TeamNodeAttributes } from "../../shared/types";
import { assets } from "../util/assets";
import { GraphConfig } from "./config";

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

type ImageLocations = {
  [NBAType.PLAYER]: SelectionMap;
  [NBAType.TEAM]: SelectionMap;
  [NBAType.FRANCHISE]: SelectionMap;
};

export const buildGraph = (data: NBAData, config: GraphConfig, imgLocations: ImageLocations): Graph => {
  console.log('Building graph');
  const graph = new DirectedGraph();

  const startYear = config.startYear ?? 0; 
  const endYear = config.endYear ?? Infinity;
  const teams: Team[] = data.teams.filter(({year}) => year >= startYear && year <= endYear);

  const playerSprite = assets.img.playerSprite();
  const teamSprite = assets.img.teamSprite();
  const franchiseSprite = assets.img.franchiseSprite();

  const playerImgLocations = imgLocations[NBAType.PLAYER];
  const teamImgLocations = imgLocations[NBAType.TEAM];
  const franchiseImgLocations = imgLocations[NBAType.FRANCHISE];

  const playerYearsActive: {[playerId: string]: number[]} = data.playerSeasons.reduce<{[playerId: string]: number[]}>((acc, {playerId, year}) => {
    const prev = acc[playerId] ?? [];

    prev.push(year);
    acc[playerId] = prev;

    return acc;
  }, {});

  data.players.forEach(player => {
    // TODO: more sophisticated size calculation, using seasons, awards, etc.
    const yearsActive = playerYearsActive[player.id];
    if (!yearsActive) throw new Error(`Unexpected error: no years active for player ${player.name}`);
    const size = yearsActive.length < 2 ? config.sizes.playerMin : config.sizes.playerDefault;

    const imgCoords = playerImgLocations[player.id];
    
    const imgProps: SpriteNodeAttributes | EmptyObject = imgCoords 
      ? {type: 'sprite', image: playerSprite, crop: imgCoords}
      : {};

    graph.addNode(player.id, {
      size, 
      label: player.name, 
      nbaType: NBAType.PLAYER,
      years: `${Math.min(...yearsActive) - 1}-${Math.max(...yearsActive)}`,
      color: config.colors.player, 
      ...imgProps, 
    } as PlayerNodeAttributes);
  });
  
  data.franchises.forEach(franchise => {
    const imgCoords = franchiseImgLocations[franchise.id];
    
    const imgProps: SpriteNodeAttributes | EmptyObject = imgCoords
      ? {type: 'sprite', image: franchiseSprite, crop: imgCoords}
      : {};
    
    graph.addNode(franchise.id, { 
      size: config.sizes.franchise, 
      label: franchise.name, 
      nbaType: NBAType.FRANCHISE,
      color: config.colors.franchise, 
      ...imgProps, 
    } as FranchiseNodeAttributes);
  });


  teams.forEach(team => {
    // 2023 => 2022-23
    const label = `${team.name} (${team.year - 1}-${team.year.toString().slice(2)})`;

    const imgCoords = teamImgLocations[team.id];
    const fallbackImgCoords = franchiseImgLocations[team.franchiseId];
    
    let imgProps: SpriteNodeAttributes | EmptyObject = {};

    if (imgCoords) {
      imgProps = {type: 'sprite', image: teamSprite, crop: imgCoords};
    } else if (fallbackImgCoords) {
      imgProps = {type: 'sprite', image: franchiseSprite, crop: fallbackImgCoords};
    }
    // TODO: should default to some generic pic if no franchise sprite is found
  
    graph.addNode(team.id, { 
      size: config.sizes.team, 
      label, 
      nbaType: NBAType.TEAM,
      color: config.colors.team, 
      ...imgProps,
    } as TeamNodeAttributes);
  });

  // TODO: edge labels not used yet
  // maybe useful for advanced filters later, but probably should remove for now to reduce size
  data.playerSeasons.forEach(pt => {
    // graph.addEdge(pt.playerId, pt.teamId, {label: 'played_on'});
    graph.addEdge(pt.playerId, pt.teamId);
  });

  teams.forEach(team => {
    // graph.addEdge(team.id, team.franchiseId, {label: 'season_of'});
    graph.addEdge(team.id, team.franchiseId);
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
