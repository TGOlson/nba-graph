import { Attributes, GraphOptions } from 'graphology-types';
import { NBAGraphEdge, NBAGraphNode } from '../shared/types';
import { assets } from '../shared/assets';

export type GraphData = {
  attributes: Attributes;
  options: GraphOptions;
  nodes: NBAGraphNode[];
  edges: NBAGraphEdge[];
};

async function fetchJSON<T> (url: string): Promise<T> {
  return fetch(url).then(res => res.json() as T);
}

export async function fetchGraphData(): Promise<GraphData> {
  return Promise.all([
    fetchJSON<Attributes>(assets.graph.attributes), 
    fetchJSON<GraphOptions>(assets.graph.options),
    fetchJSON<NBAGraphNode[]>(assets.graph.nodes),
    fetchJSON<NBAGraphEdge[]>(assets.graph.edges),
  ]).then(([
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
    
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);

    img.src = url;
  });
};
