import React from 'react';
import { ControlsContainer, FullScreenControl, SearchControl, SigmaContainer, ZoomControl } from "@react-sigma/core";

import Graph from 'graphology';
import { Settings } from 'sigma/settings';

import "@react-sigma/core/lib/react-sigma.min.css";

import { GraphData } from '../api';
import { GraphEvents } from './GraphEventHandler';
import makeNodeSpriteProgram from '../program/node-sprite';
// import getNodeImageProgram from '../program/node-sprite';
// import makeNodeSpriteProgramNaive from '../program/node-sprite-naive';
// import getNodeImageProgram from '../program/node-sprite';

type DisplayGraphProps = {
  data: GraphData,
  image: ImageData,
};

export const NBAGraph = (props: DisplayGraphProps) => {
  const graph = new Graph();
  graph.import(props.data);

  const settings: Partial<Settings> = {
    zIndex: true,
    labelDensity: 0.07,
    labelGridCellSize: 60,
    labelRenderedSizeThreshold: 15,
    labelSize: 12,
    labelWeight: 'light',
    nodeProgramClasses: {
      // image: getNodeImageProgram(),
      sprite: makeNodeSpriteProgram(props.image),
      // sprite: getNodeImageProgram(props.image), // better?!?
    },
    // edgeProgramClasses: {
    //   line: EdgesFastProgram,
    // }
  };

  return (
    <SigmaContainer 
      style={{ height: "600px" }} 
      graph={graph}
      settings={settings}
    >
      <GraphEvents />
      <ControlsContainer position={"bottom-right"}>
        <ZoomControl />
        <FullScreenControl />
      </ControlsContainer>
      <ControlsContainer position={"top-right"}>
        <SearchControl style={{ width: "200px" }} />
      </ControlsContainer>
    </SigmaContainer>
  );
};
