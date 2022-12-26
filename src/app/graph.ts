import Graph, { DirectedGraph } from "graphology";
import { circular } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';

import { NBAData } from "./api";

export const createGraph = (data: NBAData): Graph => {
  const graph = new DirectedGraph();

  // // players first, then teams
  // const players = data.players.slice(0, 100);
  // const playerIds = players.map(x => x.id);

  // const playerTeams = data.playerTeams.filter(pt => playerIds.includes(pt.playerId));
  // const playerTeamIds = playerTeams.map(x => x.teamId);
  
  // const teams = data.teams.filter(team => playerTeamIds.includes(team.id));

  // teams first, then players
  const teams = data.teams.slice(0, 20);
  const teamIds = teams.map(x => x.id);

  const playerTeams = data.playerTeams.filter(pt => teamIds.includes(pt.teamId));
  const playerIds = playerTeams.map(x => x.playerId);

  const players = data.players.filter(player => playerIds.includes(player.id));

  console.log('players', players, 'teams', teams, 'playerTeams', playerTeams);

  players.forEach(player => {
    graph.addNode(player.id, {size: 2, label: player.name, color: 'green' });
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
