import React from 'react';
import { ControlsContainer, SigmaContainer, ZoomControl } from "@react-sigma/core";
import Graph from 'graphology';
import { Settings } from 'sigma/settings';

import "@react-sigma/core/lib/react-sigma.min.css";

import { GraphData } from '../api';
import makeNodeSpriteProgram from '../program/node-sprite';
import makeNodeSpriteProgramTri from '../program/node-sprite-tri';
import { Sprite } from '../util/image';

import GraphEvents from './GraphEventHandler';
import Header from './Header';
import SearchBar from './SearchBar';
import { NodeDisplayData, PartialButFor } from 'sigma/types';
import getNodeImageProgram from '../program/node-combined-hack';

type DisplayGraphProps = {
  data: GraphData;
  sprite: Sprite;
};

const NBAGraph = (props: DisplayGraphProps) => {
  const graph = new Graph();
  graph.import(props.data);

  // const nodes = props.data.nodes.map((node) => {
  //   node.attributes = node.attributes || {};
  //   node.attributes.type = 'image';
  //   node.attributes.image = 'http://localhost:3000/assets/img/player/curryst01.jpg';

  //   return node;
  // });

  // graph.import({nodes});

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
    defaultEdgeColor: "#bbb",
    // defaultEdgeType: "line",
    labelFont: "Arial",
    labelSize: 14,
    // labelFont: "DIN Next ",
    // labelWeight: "normal",
    // labelColor: { color: "#000" },
    // edgeLabelFont: "Arial",
    // edgeLabelSize: 14,
    // edgeLabelWeight: "normal",
    // edgeLabelColor: { attribute: "color" },
    stagePadding: 64,
    
    // Labels
    labelDensity: 120,
    // labelDensity: 0.08,
    // labelGridCellSize: 200,
    labelGridCellSize: 100,
    // labelRenderedSizeThreshold: 10,
    labelRenderedSizeThreshold: 14,

    // Reducers
    // nodeReducer: null,
    // edgeReducer: null,

    // Features
    zIndex: true,
    minCameraRatio: 0.05,
    maxCameraRatio: 1.5,
    
    nodeProgramClasses: {
      // sprite: makeNodeSpriteProgram(props.sprite),
      sprite: makeNodeSpriteProgramTri(props.sprite),
      // image: getNodeImageProgram(),
    },
    // labelRenderer: drawLabel,
  };

//   function drawLabel(e: CanvasRenderingContext2D, t: PartialButFor<NodeDisplayData, "x" | "y" | "size" | "label" | "color">, r: Settings): void {
//     var u, c;
//     if (!t.label)
//         return;
//     const n = (u = t.labelSize) != null ? u : r.labelSize
//       , i = r.labelFont
//       , o = (c = t.labelWeight) != null ? c : r.labelWeight
//       , a = r.labelColor.attribute ? t[r.labelColor.attribute] || r.labelColor.color || "#000" : r.labelColor.color;
//     e.fillStyle = a,
//     e.font = `${o} ${n}px ${i}`;
//     const s = e.measureText(t.label);
//     e.fillText(t.label, t.x - s.width / 2, t.y + t.size * 1.21 + 1.2 * s.actualBoundingBoxAscent)
// }

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
