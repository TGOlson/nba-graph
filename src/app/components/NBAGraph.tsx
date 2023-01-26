import React from 'react';
import { ControlsContainer, FullScreenControl, SearchControl, SigmaContainer, ZoomControl } from "@react-sigma/core";
import Graph from 'graphology';
import { Settings } from 'sigma/settings';

import "@react-sigma/core/lib/react-sigma.min.css";

import { GraphData } from '../api';
import { GraphEvents } from './GraphEventHandler';
import makeNodeSpriteProgram from '../program/node-sprite';
import { Sprite } from '../util/image';

type DisplayGraphProps = {
  data: GraphData,
  sprite: Sprite,
};

export const NBAGraph = (props: DisplayGraphProps) => {
  const graph = new Graph();
  graph.import(props.data);

  // availble options:
  // https://github.com/jacomyal/sigma.js/blob/154408adf4d5df12df88b8d137609327c99fada8/src/settings.ts
  const settings: Partial<Settings> = {
    zIndex: true,
    // renderEdgeLabels: true,
    // edgeLabelSize: 10,
    // edgeLabelColor: { color: "#000" },
    defaultEdgeColor: '#bbb',
    labelDensity: 0.07,
    labelGridCellSize: 60,
    labelRenderedSizeThreshold: 15,
    labelSize: 12,
    labelWeight: 'light',
    nodeProgramClasses: {
      sprite: makeNodeSpriteProgram(props.sprite),
    },
  };

  return (
    <SigmaContainer 
      style={{ height: "700px" }} 
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
