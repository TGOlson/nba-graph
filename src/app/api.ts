import { Attributes, GraphOptions, SerializedEdge, SerializedNode } from 'graphology-types';
import { NodeAttributes } from '../shared/types';

type NBANode = SerializedNode & {attributes: NodeAttributes};

export type GraphData = {
  attributes: Attributes;
  options: GraphOptions;
  nodes: NBANode[];
  edges: SerializedEdge[];
};

async function fetchJSON<T> (url: string): Promise<T> {
  return fetch(url).then(res => res.json() as T);
}

export async function fetchGraphData(): Promise<GraphData> {
  return Promise.all([
    fetchJSON<Attributes>('/assets/data/graph/attributes.json'), 
    fetchJSON<GraphOptions>('/assets/data/graph/options.json'),
    fetchJSON<NBANode[]>('/assets/data/graph/nodes.json'),
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
