import Graph, { DirectedGraph } from "graphology";
import { circular } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { Team, PlayerTeam, Player } from "../shared/nba-types";

import { NBAData } from "./api";

export const createGraph = (data: NBAData): Graph => {
  const graph = new DirectedGraph();

  // grab all teams since 2010
  const teams: Team[] = data.teams.filter(team => team.year >= 2010);

  const playerTeamsByTeamId: Record<string, PlayerTeam[]> = data.playerTeams.reduce((accum: Record<string, PlayerTeam[]>, pt: PlayerTeam) => {
    const prev = accum[pt.teamId] || [];
    
    accum[pt.teamId] = [...prev, pt];

    return accum;
  }, {});

  const playerTeams = teams.map(team => playerTeamsByTeamId[team.id]).flat();

  const playersById: Record<string, Player> = data.players.reduce((accum: Record<string, Player>, player: Player) => {
    accum[player.id] = player;
    return accum;
  }, {});

  const players: Player[] = playerTeams.map(pt => playersById[pt.playerId]);

  console.log('players', players, 'teams', teams, 'playerTeams', playerTeams);

  players.forEach(player => {
    // kind of a hack around shitty data...
    // really need to filter in playerTeams to remove dupes
    if (!graph.hasNode(player.id)) {
      graph.addNode(player.id, {size: 2, label: player.name, color: 'green' });
    }
  });
  
  teams.forEach(team => {
    const label = `${team.name} (${team.year})`;
    graph.addNode(team.id, { size: 5, label, color: 'red' });
  });

  playerTeams.forEach(pt => {
    graph.addEdge(pt.playerId, pt.teamId);
  });

  // mutate graph with layouts
  circular.assign(graph);
  forceAtlas2.assign(graph, 50);

  return graph;
};
