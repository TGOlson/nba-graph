import { useEffect, useState } from 'react';
import { EventHandlers, useCamera } from "@react-sigma/core";
import { useSigma, useRegisterEvents, useSetSettings } from "@react-sigma/core";
import { Attributes } from 'graphology-types';

import "@react-sigma/core/lib/react-sigma.min.css";


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

        // if current reducer node is selected or hovered, apply styles
        if (nodeIsSelected || nodeIsHovered) return { ...data, highlighted: true };
        
        // check neighbors...
        const graph = sigma.getGraph();

        if (selectedNode && graph.neighbors(selectedNode).includes(node)) {
          return { 
            ...data, 
            highlighted: true,
          };
        }
        if (hoveredNode && graph.neighbors(hoveredNode).includes(node)) return { ...data, highlighted: true };

        // otherwise, de-emphasize node
        return {
          ...data, 
          color: '#E2E2E2', 
          label: null,
          highlighted: false,
        };
      },
      edgeReducer: (edge: string, data: Attributes): Attributes => {
        // if nothing selected or hovered, quick return default
        if (!hoveredNode && !selectedNode) return data;

        // check neighbors
        const graph = sigma.getGraph();

        const isSelectedNeighbor = selectedNode && graph.extremities(edge).includes(selectedNode);
        const isHoveredNeighbor = hoveredNode && graph.extremities(edge).includes(hoveredNode);

        if (!isSelectedNeighbor && !isHoveredNeighbor) return { ...data, hidden: true };

        return data;
      }
    });
  }, [hoveredNode, selectedNode, setSettings, sigma]);


  return null;
};
