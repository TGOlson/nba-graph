const BASE_PATH = '/nba-graph/assets';
const BASE_GRAPH_PATH = `${BASE_PATH}/data/graph`;
const BASE_SPRITE_PATH = `${BASE_PATH}/sprites`;

export const assets = {
  graph: {
    attributes: `${BASE_GRAPH_PATH}/attributes.json`,
    options: `${BASE_GRAPH_PATH}/options.json`,
    nodes: `${BASE_GRAPH_PATH}/nodes.json`,
    edges: `${BASE_GRAPH_PATH}/edges.json`,
  },
  img: {
    franchiseSprite: `${BASE_SPRITE_PATH}/franchise.png`,
    teamSprite: `${BASE_SPRITE_PATH}/team.png`,
    playerSprite: `${BASE_SPRITE_PATH}/player.png`,
    leagueSprite: `${BASE_SPRITE_PATH}/league.png`,
    awardSprite: `${BASE_SPRITE_PATH}/award.png`,
  }
};
