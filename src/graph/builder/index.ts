import Graph, { DirectedGraph } from "graphology";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";

import { NBAData, NBAType, Player, PlayerSeason, Team } from "../../shared/nba-types";
import { EmptyObject, SelectionMap, SpriteNodeAttributes } from "../../shared/types";
import { assets } from "../util/assets";
import { GraphConfig } from "./config";

const sizes = {
  franchise: 5,
  team: 4,
  playerMax: 4,
  playerDefault: 3,
  playerMin: 2
};

export const buildGraph = (data: NBAData, config: GraphConfig, imgLocations: {typ: NBAType, map: SelectionMap}[]): Graph => {
  console.log('Building graph');
  const graph = new DirectedGraph();

  const teams: Team[] = data.teams.filter(team => team.year >= config.startYear);

  const playerTeamsByTeamId: Record<string, PlayerSeason[]> = data.playerSeasons.reduce((accum: Record<string, PlayerSeason[]>, pt: PlayerSeason) => {
    const prev = accum[pt.teamId] ?? [];
    
    accum[pt.teamId] = [...prev, pt];

    return accum;
  }, {});

  const playerTeams: PlayerSeason[] = teams.map(team => {
    const res: PlayerSeason[] | undefined = playerTeamsByTeamId[team.id];

    if (!res) throw new Error('Unexpected access error');

    return res;
  }).flat();

  const playersById: Record<string, Player> = data.players.reduce((accum: Record<string, Player>, player: Player) => {
    accum[player.id] = player;
    return accum;
  }, {});

  const players: Player[] = playerTeams.map(pt => {
    const res = playersById[pt.playerId];

    if (!res) throw new Error('Unexpected access error');

    return res;
  });

  const playerSprite = assets.img.playerSprite();
  const playerLocations = imgLocations.find(({typ}) => typ === NBAType.PLAYER)?.map;
  if (!playerLocations) throw new Error('Unable to find player locations in image locations');

  players.forEach(player => {
    // kind of a hack around shitty data...
    // really need to filter in playerTeams to remove dupes
    if (!graph.hasNode(player.id)) {
      const size = player.seasons < 2 ? sizes.playerMin : sizes.playerDefault;

      const playerLocation = playerLocations[player.id];
      
      let imgProps: SpriteNodeAttributes | EmptyObject = {};
  
      if (playerLocation) {
        imgProps = {type: 'sprite', image: playerSprite, crop: playerLocation};
      }

      graph.addNode(player.id, {size, label: player.name, color: 'green', ...imgProps });
    }
  });
  
  const teamLocations = imgLocations.find(({typ}) => typ === NBAType.TEAM)?.map;
  const franchiseLocations = imgLocations.find(({typ}) => typ === NBAType.FRANCHISE)?.map;
  if (!teamLocations || !franchiseLocations) throw new Error('Unable to find team or franchise locations in image locations');

  console.log('Unique team images', Object.keys(teamLocations).length);

  const teamSprite = assets.img.teamSprite();
  const franchiseSprite = assets.img.franchiseSprite();

  if (config.includeFranchises) {
    data.franchises.forEach(franchise => {
      const franchiseLocation = franchiseLocations[franchise.id];
      
      const imgProps: SpriteNodeAttributes | EmptyObject = franchiseLocation
        ? {type: 'sprite', image: franchiseSprite, crop: franchiseLocation}
        : {};
      
      graph.addNode(franchise.id, { size: sizes.franchise, label: franchise.name, color: 'yellow', ...imgProps });
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
  
    graph.addNode(team.id, { size: sizes.team, label, color: 'red', ...imgProps });
  });

  playerTeams.forEach(pt => {
    graph.addEdge(pt.playerId, pt.teamId);
  });

  if (config.includeFranchises) {
    teams.forEach(team => {
      graph.addEdge(team.id, team.franchiseId);
    });
  }

  if (config.assignLocations) {
    console.log('Assigning locations');
    circular.assign(graph);
  
    // This call takes a little while...
    forceAtlas2.assign(graph, 50);
  }

  console.log('Done!');
  return graph;
};
