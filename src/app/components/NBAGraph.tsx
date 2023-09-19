import React, { useEffect } from 'react';
import Graph from 'graphology';
import { SigmaContainer } from "@react-sigma/core";
import { Settings } from 'sigma/settings';

import "@react-sigma/core/lib/react-sigma.min.css";

import { GraphData } from '../api';
import makeNodeSpriteProgramTriangles from '../program/node-sprite-triangles';
import { Sprite } from '../util/image';
import { GraphFilters } from '../util/types';

import GraphEvents from './GraphEventHandler';
import HeaderMenu, { DEFAULT_FILTERS } from './HeaderMenu';
import NodeSearch from './NodeSearch';
import ZoomControl from './ZoomControl';

type DisplayGraphProps = {
  data: GraphData;
  sprite: Sprite;
};

const NBAGraph = (props: DisplayGraphProps) => {
  const [graph, setGraph] = React.useState<Graph | undefined>(undefined);
  const [filters, setFilters] = React.useState<GraphFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    console.log('registering graph');
    const graph = new Graph(props.data.options);
    graph.import(props.data);
    setGraph(graph);
  }, []);

  // availble options:
  // https://github.com/jacomyal/sigma.js/blob/154408adf4d5df12df88b8d137609327c99fada8/src/settings.ts
  const settings: Partial<Settings> = {
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
    defaultNodeType: "sprite",
    // defaultEdgeColor: "#aaa",
    // defaultEdgeType: "line",
    labelFont: "Arial",
    labelSize: 14,
    // labelWeight: "normal",
    // labelColor: { color: "#000" },
    // edgeLabelFont: "Arial",
    // edgeLabelSize: 14,
    // edgeLabelWeight: "normal",
    // edgeLabelColor: { attribute: "color" },
    // stagePadding: 30,
  
    // Labels
    // labelDensity: 1,
    // labelGridCellSize: 100,
    labelRenderedSizeThreshold: 20,

    // Reducers
    // nodeReducer: null,
    // edgeReducer: null,

    // Features
    zIndex: true,
    minCameraRatio: 0.01,
    maxCameraRatio: 1.5,
    
    nodeProgramClasses: {
      sprite: makeNodeSpriteProgramTriangles(props.sprite),
    },
  };

  const onFilterChange = (change: Partial<GraphFilters>) => {
    setFilters({ ...filters, ...change });
  };

  return (
    <SigmaContainer 
      style={{ height: "100vh", backgroundColor: "#fcfcfc" }} 
      graph={graph}
      settings={settings}
    >
      <GraphEvents filters={filters}/>
      <HeaderMenu filters={filters} onFilterChange={onFilterChange}/>
      <NodeSearch nodes={props.data.nodes} />
      <ZoomControl />
    </SigmaContainer>
  );
};

export default NBAGraph;
