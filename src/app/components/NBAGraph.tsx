import React, { useEffect, useState } from 'react';
import Graph from 'graphology';
import { SigmaContainer } from "@react-sigma/core";
import { Settings } from 'sigma/settings';

import "@react-sigma/core/lib/react-sigma.min.css";

import { GraphData } from '../api';
import makeNodeSpriteProgramTriangles from '../program/node-sprite-triangles';
import { GraphFilters, Sprite } from '../util/types';

import GraphEvents, { isVisibleNode } from './GraphEventHandler';
import HeaderMenu, { DEFAULT_FILTERS } from './HeaderMenu';
import NodeSearch from './NodeSearch';
import ZoomControl from './ZoomControl';
import { logDebug } from '../util/logger';

type DisplayGraphProps = {
  data: GraphData;
  sprites: Sprite[];
};

const NBAGraph = ({data, sprites}: DisplayGraphProps) => {
  const [graph, setGraph] = useState<Graph | undefined>(undefined);
  const [filters, setFilters] = useState<GraphFilters>(DEFAULT_FILTERS);
  const [settings, setSettings] = useState<Partial<Settings>>({});

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
      
      nodeProgramClasses,
    });
  }, []);


  useEffect(() => {
    logDebug('Registering graph');

    const graph = new Graph(data.options);
    graph.import(data);

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
