import { Attributes, GraphOptions, SerializedEdge } from 'graphology-types';
import { NBAGraphNode } from '../shared/types';
import { NBAType } from '../shared/nba-types';
import { fetchImage } from './util/image';

export type GraphData = {
  attributes: Attributes;
  options: GraphOptions;
  nodes: NBAGraphNode[];
  edges: SerializedEdge[];
};

export type SpriteMap = {
  franchise: HTMLImageElement;
  team: HTMLImageElement;
  player: HTMLImageElement;
  league: HTMLImageElement;
  award: HTMLImageElement;
};

const fetchSprite = (typ: NBAType): Promise<HTMLImageElement> => {
  return fetchImage(`/assets/sprites/${typ}.png`);
};

export async function fetchSprites(): Promise<SpriteMap> {
  return Promise.all([
    fetchSprite('franchise'),
    fetchSprite('team'),
    fetchSprite('player'),
    fetchSprite('league'),
    fetchSprite('award'),
  ])
    .then(([franchise, team, player, league, award]) => {
      return {franchise, team, player, league, award};
    });
}

async function fetchJSON<T> (url: string): Promise<T> {
  return fetch(url).then(res => res.json() as T);
}

export async function fetchGraphData(): Promise<GraphData> {
  return Promise.all([
    fetchJSON<Attributes>('/assets/data/graph/attributes.json'), 
    fetchJSON<GraphOptions>('/assets/data/graph/options.json'),
    fetchJSON<NBAGraphNode[]>('/assets/data/graph/nodes.json'),
    fetchJSON<SerializedEdge[]>('/assets/data/graph/edges.json'),
  ])
    .then(([
      attributes,
      options,
      nodes,
      edges,
    ]) => {
      return { attributes, options, nodes, edges };
    });
}
