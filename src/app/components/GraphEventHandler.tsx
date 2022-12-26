import { useEffect, useState } from 'react';
import { EventHandlers } from "@react-sigma/core";
import { useSigma, useRegisterEvents, useSetSettings } from "@react-sigma/core";

import "@react-sigma/core/lib/react-sigma.min.css";

import { Attributes } from 'graphology-types';

export const GraphEvents = () => {
  const sigma = useSigma();
  const setSettings = useSetSettings();
  const registerEvents: (eventHandlers: Partial<EventHandlers>) => void = useRegisterEvents();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Set up event handlers
  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        setSelectedNode(event.node);
        setHoveredNode(null);
      },
      enterNode: (event) => setHoveredNode(event.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [registerEvents]);

  useEffect(() => {
    setSettings({
      nodeReducer: (node: string, data: Attributes): Attributes => {
        // if nothing selected or hovered, quick return
        if (!hoveredNode && !selectedNode) return data;

        const nodeIsSelected = selectedNode === node;
        const nodeIsHovered = hoveredNode === node;

        // if current reducer node is selected or hovered, apply styles
        if (nodeIsSelected || nodeIsHovered) return { ...data, highlighted: true };
        
        // check neighbors...
        const graph = sigma.getGraph();
        if (selectedNode && graph.neighbors(selectedNode).includes(node)) return { ...data, highlighted: true };
        if (hoveredNode && graph.neighbors(hoveredNode).includes(node)) return { ...data, highlighted: true };

        // otherwise, nothing
        return {...data, color: '#E2E2E2', highlighted: false };
      },
      edgeReducer: (edge: string, data: Attributes): Attributes => {
          // if nothing selected or hovered, quick return
          if (!hoveredNode && !selectedNode) return data;

        const graph = sigma.getGraph();

        // check neighbors...
        // if (selectedNode || hoveredNode) {
        const isSelectedNeighbor = selectedNode && graph.extremities(edge).includes(selectedNode);
        const isHoveredNeighbor = hoveredNode && graph.extremities(edge).includes(hoveredNode);

        if (!isSelectedNeighbor && !isHoveredNeighbor) return { ...data, hidden: true };

        // }
        // if (selectedNode && !graph.extremities(edge).includes(selectedNode)) return { ...data, hidden: true };
        // if (hoveredNode && !graph.extremities(edge).includes(hoveredNode)) return { ...data, hidden: true };

        return data;
      }
    });
  }, [hoveredNode, setSettings, sigma]);


  return null;
};
