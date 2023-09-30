const BASE_PATH = '/assets';
const BASE_GRAPH_PATH = `${BASE_PATH}/data/graph`;
const BASE_SPRITE_PATH = `${BASE_PATH}/sprites`;

export const assets = {
  graph: {
    attributes: `${BASE_GRAPH_PATH}/attributes.json`,
    options: `${BASE_GRAPH_PATH}/options.json`,
    nodes: `${BASE_GRAPH_PATH}/nodes.json`,
    edges: `${BASE_GRAPH_PATH}/edges.json`,
  },
  spriteUrl: (spriteId: string) => `${BASE_SPRITE_PATH}/${spriteId}.png`,
};
