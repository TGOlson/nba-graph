import React from 'react';
import { ControlsContainer, FullScreenControl, SearchControl, SigmaContainer, ZoomControl } from "@react-sigma/core";

import "@react-sigma/core/lib/react-sigma.min.css";

import { createGraph } from '../graph';
import { NBAData } from '../api';
import { GraphEvents } from './GraphEventHandler';

type DisplayGraphProps = {
  data: NBAData
};

export const DisplayGraph = (props: DisplayGraphProps) => {

  // TODO: should make this async, graph can take a while to create...
  const graph = createGraph(props.data);

  return (
    <SigmaContainer 
      style={{ height: "700px" }} 
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
