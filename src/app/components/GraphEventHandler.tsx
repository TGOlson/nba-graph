import { useEffect, useState } from 'react';
import { EventHandlers, useCamera } from "@react-sigma/core";
import { useSigma, useRegisterEvents, useSetSettings } from "@react-sigma/core";
import { Attributes } from 'graphology-types';
// import { circular } from "graphology-layout";

import "@react-sigma/core/lib/react-sigma.min.css";
// import Graph from 'graphology';

export const GraphEvents = () => {
  const sigma = useSigma();
  const setSettings = useSetSettings();
  const registerEvents: (eventHandlers: Partial<EventHandlers>) => void = useRegisterEvents();
  const { gotoNode } = useCamera();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Set up event handlers
  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        console.log(sigma.getGraph().getNodeAttributes(event.node));
        if (selectedNode === event.node) {
          setSelectedNode(null);
        } else {
          setSelectedNode(event.node);
          gotoNode(event.node);
        }
        setHoveredNode(null);
      },
      enterNode: (event) => setHoveredNode(event.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [registerEvents, selectedNode, hoveredNode]);

  useEffect(() => {
    setSettings({
      // TODO: think about intented UI here, kind of messy interactions right now
      nodeReducer: (node: string, data: Attributes): Attributes => {
        // if nothing selected or hovered, quick return default
        if (!hoveredNode && !selectedNode) return data;

        const nodeIsSelected = selectedNode === node;
        const nodeIsHovered = hoveredNode === node;

        (window as any).sigma = sigma;
        
        // check neighbors...
        const graph = sigma.getGraph();
        // const selectedNe = graph.neighbors(selectedNode);

        if (selectedNode && graph.neighbors(selectedNode).includes(node)) {
          // const neighbors = graph.neighbors(selectedNode);

          // const tempGraph = new Graph();
          // neighbors.forEach(n => tempGraph.addNode(n));
          // // circular.
          // const positions = circular(tempGraph, { scale: sigma.getCamera().ratio * 500 });
          // // const 
          // const { x: baseX, y: baseY } = graph.getNodeAttributes(selectedNode);
          // const pos = positions[node];

          // if (!pos) throw new Error('Unexpected access error');
          
          // const currX = pos.x;
          // const currY = pos.y;
          
          // if (currX === undefined) throw new Error('Unexpected access error');
          // if (currY === undefined) throw new Error('Unexpected access error');

          // const newX = currX + (baseX as number);
          // const newY = currY + (baseY as number);
          // // debugger;
          // // positions.


          return { 
            ...data, 
            highlighted: true,
            size: data.size as number + 3
            // x: newX,
            // y: newY,
          };
        }


        // if current reducer node is selected or hovered, apply styles
        if (nodeIsSelected) return { ...data, highlighted: true, size: data.size as number + 3 };
        if (nodeIsHovered) return { ...data, highlighted: true };
        
        if (hoveredNode && graph.neighbors(hoveredNode).includes(node)) return { ...data, highlighted: true };

        // otherwise, de-emphasize node
        return {
          ...data, 
          color: '#E2E2E2',
          // Test switching images to de-emphasize. Later this should switch to black & white image version...
          // image: 'https://cdn.ssref.net/req/202212191/tlogo/bbr/MIN.png',
          type: null,
          label: null,
          highlighted: false,
        };
      },
      edgeReducer: (edge: string, data: Attributes): Attributes => {
        // if nothing selected or hovered, hide all edges
        if (!hoveredNode && !selectedNode) return { ...data, hidden: true };

        // check neighbors
        const graph = sigma.getGraph();

        const isSelectedNeighbor = selectedNode && graph.extremities(edge).includes(selectedNode);
        const isHoveredNeighbor = hoveredNode && graph.extremities(edge).includes(hoveredNode);

        // if it's an edge of a selected node, don't hide
        if (isSelectedNeighbor || isHoveredNeighbor) return data;

        return { ...data, hidden: true };
      }
    });
  }, [hoveredNode, selectedNode, setSettings, sigma]);


  return null;
};
