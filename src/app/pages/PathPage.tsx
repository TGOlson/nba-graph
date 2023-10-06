import React, { useEffect, useState } from 'react';

import Graph from 'graphology';

import { fetchGraphData } from '../api';
import { NBAGraphNode } from '../../shared/types';

import PathSearch from '../components/PathSearch';

const PathPage = () => {
  console.log('rendering Paths');

  const [players, setPlayers] = useState<NBAGraphNode[]>([]);
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    void fetchGraphData().then((data) => {
      const players = data.nodes.filter(x => x.attributes.nbaType === 'player');
      setPlayers(players);

      const graph = new Graph(data.options);
      graph.import(data);

      graph.forEachNode((node) => {
        const { nbaType } = graph.getNodeAttributes(node) as NBAGraphNode['attributes'];

        if (nbaType !== 'player' && nbaType !== 'team') {
          graph.dropNode(node);
        } 
      });

      setGraph(graph);
    });
  }, []);

  return graph && <PathSearch graph={graph} searchNodes={players} />;
};

export default PathPage;
