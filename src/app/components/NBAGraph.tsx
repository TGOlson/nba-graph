import React, { useEffect, useState } from 'react';
import Graph from 'graphology';
import { SigmaContainer } from "@react-sigma/core";
import { Settings } from 'sigma/settings';

import "@react-sigma/core/lib/react-sigma.min.css";

import { GraphData } from '../api';
import makeNodeSpriteProgramTriangles from '../program/node-sprite-triangles';
import { GraphFilters } from '../util/types';

import GraphEvents, { isVisibleNode } from './GraphEventHandler';
import HeaderMenu, { DEFAULT_FILTERS } from './HeaderMenu';
import NodeSearch from './NodeSearch';
import ZoomControl from './ZoomControl';
import { logDebug } from '../util/logger';
import { Sprite } from '../util/image';

type DisplayGraphProps = {
  data: GraphData;
  sprite: Sprite;
};

const NBAGraph = ({data, sprite}: DisplayGraphProps) => {
  const [graph, setGraph] = useState<Graph | undefined>(undefined);
  const [filters, setFilters] = useState<GraphFilters>(DEFAULT_FILTERS);
  const [settings, setSettings] = useState<Partial<Settings>>({});

  // Note: put settings in a setup function so we don't re-instantiate the program class on each render
  useEffect(() => {
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
      
      // TODO: not sure it's optimal to make so many program classes
      // might be better to pass in multiple sprites and attempt to switch textures on render
      nodeProgramClasses: {
        sprite: makeNodeSpriteProgramTriangles(sprite, 'sprite'),
      },
    });
  }, []);


  useEffect(() => {
    logDebug('Registering graph');

    const graph = new Graph(data.options);
    
    const nodes = data.nodes.map((node) => {
      return {...node, attributes: {...node.attributes, type: 'sprite'}};
    });

    graph.import({...data, nodes});
    setGraph(graph);
  }, []);

  const onFilterChange = (change: Partial<GraphFilters>) => {
    setFilters({ ...filters, ...change });
  };

  const nodes = data.nodes.filter((node) => isVisibleNode(filters, node.attributes));

  return (
    <SigmaContainer 
      style={{ height: "100vh", backgroundColor: "#fcfcfc" }} 
      graph={graph}
      settings={settings}
    >
      <GraphEvents filters={filters}/>
      <HeaderMenu filters={filters} onFilterChange={onFilterChange}/>
      <NodeSearch nodes={nodes} />
      <ZoomControl />
    </SigmaContainer>
  );
};

export default NBAGraph;
