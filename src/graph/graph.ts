import Graph, { DirectedGraph } from "graphology";

import { NBAData, Player, PlayerSeason, Team } from "../shared/nba-types";
// import { Franchise, League, NBAData, Player, PlayerSeason, Season, Team } from "../shared/nba-types";

export const buildGraph = (data: NBAData): Graph => {
  const graph = new DirectedGraph();

  const teams: Team[] = data.teams.filter(team => team.year >= 2020);

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
    graph.addNode(team.id, { size: 5, label, color: 'red' });
  });

  playerTeams.forEach(pt => {
    graph.addEdge(pt.playerId, pt.teamId);
  });

  return graph;
};
