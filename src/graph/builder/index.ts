import Graph, { DirectedGraph } from "graphology";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";

import { NBAData, Player, PlayerSeason, Team } from "../../shared/nba-types";
import { assets } from "../util/assets";
import { GraphConfig } from "./config";

export const buildGraph = (data: NBAData, config: GraphConfig): Graph => {
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

  // console.log('players', players, 'teams', teams, 'playerTeams', playerTeams);

  players.forEach(player => {
    // kind of a hack around shitty data...
    // really need to filter in playerTeams to remove dupes
    if (!graph.hasNode(player.id)) {
      graph.addNode(player.id, {size: 2, label: player.name, color: 'green' });
    }
  });
  
  teams.forEach(team => {
    const label = `${team.name} (${team.year})`;

    const image = assets.img.franchise(team.franchiseId);
    graph.addNode(team.id, { size: 5, label, color: 'red', image, type: 'image' });
  });

  playerTeams.forEach(pt => {
    graph.addEdge(pt.playerId, pt.teamId);
  });

  if (config.assignLocations) {
    console.log('Assigning locations');
    circular.assign(graph);
  
    // This call takes a little while...
    forceAtlas2.assign(graph, 50);
  }

  console.log('Done!');
  return graph;
};
