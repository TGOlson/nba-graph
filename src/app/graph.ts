import Graph, { DirectedGraph } from "graphology";
import forceAtlas2 from 'graphology-layout-forceatlas2';

import { NBAData } from "./api";

export const createGraph = (data: NBAData): Graph => {
  const graph = new DirectedGraph();

  // Test: grab a single player, filter their teams
  const players = data.players.slice(10, 11);
  const playerIds = players.map(x => x.id);

  const playerTeams = data.playerTeams.filter(pt => playerIds.includes(pt.playerId));
  const playerTeamIds = playerTeams.map(x => x.teamId);
  
  const teams = data.teams.filter(team => playerTeamIds.includes(team.id));

  console.log('players', players, 'teams', teams, 'playerTeams', playerTeams);

  players.forEach(player => {
    graph.addNode(player.id, {x: randInt(100), y: randInt(100), size: 5, label: player.name});
  });
  
  teams.forEach(team => {
    const label = `${team.name} (${team.year})`;
    graph.addNode(team.id, {x: randInt(100), y: randInt(100), size: 5, label });
  });

  playerTeams.forEach(pt => {
    graph.addEdge(pt.playerId, pt.teamId);
  });

  // graph.addNode("first", { x: 0, y: 0, size: 15, label: "My first node", color: "#FA4F40" });


  const settings = forceAtlas2.inferSettings(graph);
  const positions = forceAtlas2(graph, {
    iterations: 50,
    settings
  });

  console.log('settings', settings);
  console.log('positions', positions);

  // forceAtlas2.assign(graph);
  forceAtlas2.assign(graph, 50);


  return graph;
};

const randInt = (max: number): number =>
  Math.floor(Math.random() * max);
