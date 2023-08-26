import React from 'react';
import { ControlsContainer, SigmaContainer, ZoomControl } from "@react-sigma/core";
import Graph from 'graphology';
import { Settings } from 'sigma/settings';

import "@react-sigma/core/lib/react-sigma.min.css";

import { GraphData } from '../api';
import makeNodeSpriteProgramTriangles from '../program/node-sprite-triangles';
import { Sprite } from '../util/image';

import GraphEvents from './GraphEventHandler';
import Header from './Header';
import SearchBar from './SearchBar';

type DisplayGraphProps = {
  data: GraphData;
  sprite: Sprite;
};

const NBAGraph = (props: DisplayGraphProps) => {
  const graph = new Graph();
  graph.import(props.data);

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
    defaultEdgeColor: "#aaa",
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

  return (
    <SigmaContainer 
      style={{ height: "100vh", backgroundColor: "#f8f8f9" }} 
      graph={graph}
      settings={settings}
    >
      <Header />
      <SearchBar nodes={props.data.nodes} />
      <GraphEvents />
      <ControlsContainer position={"bottom-right"}>
        <ZoomControl />
      </ControlsContainer>
    </SigmaContainer>
  );
};

export default NBAGraph;
