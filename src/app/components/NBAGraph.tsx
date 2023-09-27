import React, { useEffect, useState } from 'react';
import Graph from 'graphology';
import { SigmaContainer, useSigma } from "@react-sigma/core";
import { Settings } from 'sigma/settings';

import "@react-sigma/core/lib/react-sigma.min.css";

import { GraphData } from '../api';
import makeNodeSpriteProgramTriangles from '../program/node-sprite-triangles';
import { GraphFilters, Sprite } from '../util/types';

import GraphEvents, { isVisibleNode } from './GraphEventHandler';
import SidePanel, { DEFAULT_FILTERS } from './SidePanel';
import NodeSearch from './NodeSearch';
import ZoomControl from './ZoomControl';
import { logDebug } from '../util/logger';
import { NBAGraphNode } from '../../shared/types';
import { useSelectedNode } from '../hooks/useSelectedNode';

type DisplayGraphProps = {
  data: GraphData;
  sprites: Sprite[];
};

// Do this to provide multiple components with access to the selected node
const InnerComponents = ({nodes}: {nodes: GraphData['nodes']}) => {
  const [filters, setFilters] = useState<GraphFilters>(DEFAULT_FILTERS);
  const useSelectedNodeRes = useSelectedNode();
  const {selectedNode, setSelectedNode} = useSelectedNodeRes;

  const sigma = useSigma();

  useEffect(() => {
    const camera = sigma.getCamera();

    const nba = sigma.getNodeDisplayData('NBA');

    if (nba) camera.animate({
      x: nba.x,
      y: nba.y,
      ratio: 1 / 3,
    });
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
      <GraphEvents filters={filters} {...useSelectedNodeRes} />
      <SidePanel filters={filters} nodeCounts={nodeCounts} selectedNode={selectedNode} onFilterChange={onFilterChange}/>
      <NodeSearch nodes={visibleNodes} setSelectedNode={setSelectedNode}/>
      <ZoomControl />
    </React.Fragment>
  );
};

const NBAGraph = ({data, sprites}: DisplayGraphProps) => {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [settings, setSettings] = useState<Partial<Settings> | null>(null);

  // Note: in a setup function so we don't re-instantiate the program class on each render
  useEffect(() => {

    // TODO: not sure it's optimal to make so many program classes
    // might be better to pass in multiple sprites and attempt to switch textures on render
    const nodeProgramClasses = sprites.reduce((acc, sprite) => {
      return {...acc, [sprite.key]: makeNodeSpriteProgramTriangles(sprite)};
    }, {});

    // availble options:
    // https://github.com/jacomyal/sigma.js/blob/154408adf4d5df12df88b8d137609327c99fada8/src/settings.ts
    setSettings({
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
      zIndex: true,
      minCameraRatio: 0.01,
      maxCameraRatio: 1.5,
      
      nodeProgramClasses,
    });

    logDebug('Registering graph');

    const graph = new Graph(data.options);
    graph.import(data);

    setGraph(graph);
  }, []);

  return graph && settings 
    ? <SigmaContainer 
      style={{ height: "100vh", backgroundColor: "#fcfcfc", overflowX: 'hidden' }} 
      graph={graph}
      settings={settings}
    >
      <InnerComponents nodes={data.nodes}/>
    </SigmaContainer> 
    : null;
};

export default NBAGraph;
