import { Attributes, GraphOptions, SerializedEdge } from 'graphology-types';
import { NBAGraphNode } from '../shared/types';
import { assets } from '../shared/constants';

export type GraphData = {
  attributes: Attributes;
  options: GraphOptions;
  nodes: NBAGraphNode[];
  edges: SerializedEdge[];
};

async function fetchJSON<T> (url: string): Promise<T> {
  return fetch(url).then(res => res.json() as T);
}

export async function fetchGraphData(): Promise<GraphData> {
  return Promise.all([
    fetchJSON<Attributes>(assets.graph.attributes), 
    fetchJSON<GraphOptions>(assets.graph.options),
    fetchJSON<NBAGraphNode[]>(assets.graph.nodes),
    fetchJSON<SerializedEdge[]>(assets.graph.edges),
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

export const fetchImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };

    img.onerror = (err) => {
      reject(err);
    };

    img.src = url;
  });
};
