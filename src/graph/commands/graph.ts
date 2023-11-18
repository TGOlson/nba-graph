import { GRAPH_CONFIG } from "../builder/config";
import { loadNBAData, persistGraph } from "../storage";

import { buildGraph as buildGraphInternal } from "../builder";


export const buildGraph = async () => {
  const nbaData = await loadNBAData();
  const graph = await buildGraphInternal(nbaData, GRAPH_CONFIG);

  return persistGraph(graph);
};
