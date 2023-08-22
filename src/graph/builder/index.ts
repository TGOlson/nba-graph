import Graph, { DirectedGraph } from "graphology";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";

import { NBAData, NBAType, Player, PlayerSeason, Team } from "../../shared/nba-types";
import { EmptyObject, SelectionMap, SpriteNodeAttributes } from "../../shared/types";
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

export const buildGraph = (data: NBAData, config: GraphConfig, imgLocations: {typ: NBAType, map: SelectionMap}[]): Graph => {
  console.log('Building graph');
  const graph = new DirectedGraph();

  let teams: Team[] = config.startYear ? data.teams.filter(team => team.year >= (config.startYear as number)) : data.teams;
  teams = config.endYear ? teams.filter(team => team.year <= (config.endYear as number)) : teams;
  
  const franchiseIdMap: {[key: string]: boolean} = teams.reduce((acc, team) => ({...acc, [team.franchiseId]: true}), {});
  const franchises = data.franchises.filter(franchise => franchiseIdMap[franchise.id]);

  const playerTeamsByTeamId: Record<string, PlayerSeason[]> = data.playerSeasons.reduce((accum: Record<string, PlayerSeason[]>, pt: PlayerSeason) => {
    const prev = accum[pt.teamId] ?? [];
    
    accum[pt.teamId] = [...prev, pt];

    return accum;
  }, {});

  const playerTeams: PlayerSeason[] = teams.map(team => {
    const res: PlayerSeason[] | undefined = playerTeamsByTeamId[team.id];

    if (!res) throw new Error(`Unexpected access error: unable to find player teams for team: ${team.id}`);

    return res;
  }).flat();

  const playersById: Record<string, Player> = data.players.reduce((accum: Record<string, Player>, player: Player) => {
    accum[player.id] = player;
    return accum;
  }, {});

  const players: Player[] = playerTeams.map(pt => {
    const res = playersById[pt.playerId];

    if (!res) throw new Error(`Unexpected access error: unable to find player for player team: ${pt.playerId}`);

    return res;
  });

  const playerSprite = assets.img.playerSprite();
  const playerLocations = imgLocations.find(({typ}) => typ === NBAType.PLAYER)?.map;
  if (!playerLocations) throw new Error('Unable to find player locations in image locations');

  players.forEach(player => {
    // kind of a hack around shitty data...
    // really need to filter in playerTeams to remove dupes
    if (!graph.hasNode(player.id)) {
      const size = player.seasons < 2 ? config.sizes.playerMin : config.sizes.playerDefault;

      const playerLocation = playerLocations[player.id];
      
      let imgProps: SpriteNodeAttributes | EmptyObject = {};
  
      if (playerLocation) {
        imgProps = {type: 'sprite', image: playerSprite, crop: playerLocation};
      }

      graph.addNode(player.id, {
        size, 
        label: player.name, 
        nbaType: NBAType.PLAYER,
        color: config.colors.player, 
        ...imgProps, 
      });
    } else {
      console.log(`Skipping duplicate player: ${player.name}, ${player.id}}`);
    }
  });
  
  const teamLocations = imgLocations.find(({typ}) => typ === NBAType.TEAM)?.map;
  const franchiseLocations = imgLocations.find(({typ}) => typ === NBAType.FRANCHISE)?.map;
  if (!teamLocations || !franchiseLocations) throw new Error('Unable to find team or franchise locations in image locations');

  const teamSprite = assets.img.teamSprite();
  const franchiseSprite = assets.img.franchiseSprite();

  if (config.includeFranchises) {
    franchises.forEach(franchise => {
      const franchiseLocation = franchiseLocations[franchise.id];
      
      const imgProps: SpriteNodeAttributes | EmptyObject = franchiseLocation
        ? {type: 'sprite', image: franchiseSprite, crop: franchiseLocation}
        : {};
      
      graph.addNode(franchise.id, { 
        size: config.sizes.franchise, 
        label: franchise.name, 
        nbaType: NBAType.FRANCHISE,
        color: config.colors.franchise, 
        ...imgProps, 
      });
    });
  }

  teams.forEach(team => {
    const label = `${team.name} (${team.year})`;

    const teamLocation = teamLocations[team.id];
    const franchiseLocation = franchiseLocations[team.franchiseId];
    
    let imgProps: SpriteNodeAttributes | EmptyObject = {};

    if (teamLocation && config.useYearSpecificTeamLogos) {
      imgProps = {type: 'sprite', image: teamSprite, crop: teamLocation};
    } else if (franchiseLocation) {
      imgProps = {type: 'sprite', image: franchiseSprite, crop: franchiseLocation};
    }
    // TODO: should default to some generic pic if no franchise sprite is found
  
    graph.addNode(team.id, { 
      size: config.sizes.team, 
      label, 
      nbaType: NBAType.TEAM,
      color: config.colors.team, 
      ...imgProps,
    });
  });

  // TODO: edge labels not used yet
  // maybe useful for advanced filters later, but probably should remove for now to reduce size
  playerTeams.forEach(pt => {
    graph.addEdge(pt.playerId, pt.teamId, {label: 'played_on'});
  });

  if (config.includeFranchises) {
    teams.forEach(team => {
      graph.addEdge(team.id, team.franchiseId, {label: 'season_of'});
    });
  }

  if (config.assignLocations) {
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
  }

  console.log('Done!');
  return graph;
};
