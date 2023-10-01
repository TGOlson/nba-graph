import React, { useEffect, useState } from 'react';
import Graph from 'graphology';
import { SigmaContainer, useSigma } from "@react-sigma/core";

import GraphEvents, { isVisibleNode } from './GraphEventHandler';
import SidePanel, { DEFAULT_FILTERS } from './SidePanel';
import NodeSearch from './NodeSearch';
import ZoomControl from './ZoomControl';

import { GraphFilters, Sprite } from '../util/types';
import { GraphData } from '../api';
import makeNodeSpriteProgramTriangles from '../program/node-sprite-triangles';
import { logDebug } from '../util/logger';
import { NBAGraphNode } from '../../shared/types';
import { useSelectedNode } from '../hooks/useSelectedNode';

import "@react-sigma/core/lib/react-sigma.min.css";

type DisplayGraphProps = {
  data: GraphData;
  sprites: Sprite[];
};

const InnerComponents = ({nodes}: {nodes: GraphData['nodes']}) => {
  const sigma = useSigma();

  // for debugging...
  (window as any).sigma = sigma; // eslint-disable-line

  const [filters, setFilters] = useState<GraphFilters>(DEFAULT_FILTERS);
  const [selectedNode, setSelectedNode] = useSelectedNode();

  useEffect(() => {
    const camera = sigma.getCamera();
    const nba = sigma.getNodeDisplayData('NBA');

    if (nba) camera.animate({
      x: nba.x,
      y: nba.y,
      ratio: 1 / 3,
    }, {duration: 1000});
  }, []);

  const onFilterChange = (change: Partial<GraphFilters>) => {
    setFilters({ ...filters, ...change });
  };

  const visibleNodes: NBAGraphNode[] = [];
  const nodeCounts: {[key: string]: {visible: number, total: number}} = {};

  nodes.forEach((node) => {
    const isVisible = isVisibleNode(filters, node.attributes);
    if (isVisible) visibleNodes.push(node);

    const key = node.attributes.nbaType === 'multi-winner-award' ? 'award' : node.attributes.nbaType;
    const prev = nodeCounts[key] ?? {visible: 0, total: 0};
    prev.total++;
    if (isVisible) prev.visible++;

    nodeCounts[key] = prev;
  });

  return (
    <React.Fragment>
      <GraphEvents filters={filters} selectedNode={selectedNode} setSelectedNode={setSelectedNode} />
      <SidePanel filters={filters} nodeCounts={nodeCounts} selectedNode={selectedNode} onFilterChange={onFilterChange}/>
      <NodeSearch nodes={visibleNodes} setSelectedNode={setSelectedNode}/>
      <ZoomControl />
    </React.Fragment>
  );
};

const NBAGraph = ({data, sprites}: DisplayGraphProps) => {
  const nodeProgramClasses = sprites.reduce((acc, sprite) => {
    return {...acc, [sprite.key]: makeNodeSpriteProgramTriangles(sprite)};
  }, {});

  // Availble settings:
  // https://github.com/jacomyal/sigma.js/blob/154408adf4d5df12df88b8d137609327c99fada8/src/settings.ts
  const settings = ({
    // Performance
    // hideEdgesOnMove: false,
    // hideLabelsOnMove: false,
    // renderLabels: true,
    // renderEdgeLabels: false,
    // enableEdgeClickEvents: false,
    // enableEdgeWheelEvents: false,
    // enableEdgeHoverEvents: false,

    // Component rendering
    // defaultNodeColor: "#999",
    defaultNodeType: "circle",
    // defaultEdgeColor: "#aaa",
    // defaultEdgeType: "line",
    labelFont: "Arial",
    labelSize: 14,
    labelWeight: "500",
    // labelColor: { color: "#000" },
    // edgeLabelFont: "Arial",
    // edgeLabelSize: 14,
    // edgeLabelWeight: "normal",
    // edgeLabelColor: { attribute: "color" },
    // stagePadding: 30,
  
    // Labels
    // labelDensity: 1,
    // labelGridCellSize: 100,
    labelRenderedSizeThreshold: 25,

    // Reducers
    // nodeReducer: null,
    // edgeReducer: null,

    // Features
    zIndex: false,
    minCameraRatio: 0.025,
    maxCameraRatio: 1.2,
    
    nodeProgramClasses,
  });

  logDebug('Registering graph');

  const graph = new Graph(data.options);
  graph.import(data);

  return (
    <SigmaContainer 
      style={{ height: "100vh", backgroundColor: "#fcfcfc", overflowX: 'hidden' }} 
      graph={graph}
      settings={settings}
    >
      <InnerComponents nodes={data.nodes}/>
    </SigmaContainer>
  );
};

export default NBAGraph;
