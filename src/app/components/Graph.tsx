import React from 'react';
import { ControlsContainer, FullScreenControl, SearchControl, SigmaContainer, ZoomControl } from "@react-sigma/core";

import "@react-sigma/core/lib/react-sigma.min.css";

import { GraphData } from '../api';
import { GraphEvents } from './GraphEventHandler';
import Graph from 'graphology';

type DisplayGraphProps = {
  data: GraphData
};

export const DisplayGraph = (props: DisplayGraphProps) => {
  const graph = new Graph();
  graph.import(props.data);

  return (
    <SigmaContainer 
      style={{ height: "600px" }} 
      graph={graph}
      settings={{
        zIndex: true // TODO: what does this do?
      }}
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
