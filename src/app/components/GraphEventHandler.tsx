import { useEffect, useState } from 'react';
import { EventHandlers, useCamera } from "@react-sigma/core";
import { useSigma, useRegisterEvents, useSetSettings } from "@react-sigma/core";
import { Attributes } from 'graphology-types';
import { animateNodes } from 'sigma/utils/animate';
import Graph from 'graphology';
import { circular } from 'graphology-layout';

import "@react-sigma/core/lib/react-sigma.min.css";

type Props = {
  moveNeighborsOnClick?: boolean
};

const defaultProps: Props = {
  moveNeighborsOnClick: false,
};

export const GraphEvents = (props: Props = defaultProps) => {
  const sigma = useSigma();
  (window as any).sigma = sigma; // eslint-disable-line

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

        // check neighbors...
        const graph = sigma.getGraph();
        // const selectedNe = graph.neighbors(selectedNode);

        if (selectedNode && graph.neighbors(selectedNode).includes(node)) {
          if (props.moveNeighborsOnClick) {
            const neighbors = graph.neighbors(selectedNode);

            const tempGraph = new Graph();
            neighbors.forEach(n => tempGraph.addNode(n));

            const positions = circular(tempGraph, { scale: sigma.getCamera().ratio * 2000 });

            const { x: baseX, y: baseY } = graph.getNodeAttributes(selectedNode);
            const pos = positions[node];

            if (!pos) throw new Error('Unexpected access error');
            
            const currX = pos.x;
            const currY = pos.y;
            
            if (currX === undefined || currY === undefined) throw new Error('Unexpected access error');
            
            const newX = currX + (baseX as number);
            const newY = currY + (baseY as number);

            animateNodes(graph, {[node]: {x: newX, y: newY}}, { duration: 75 });
            graph.updateNodeAttribute(node, 'x', () => newX);
            graph.updateNodeAttribute(node, 'y', () => newY);
          }

          return { 
            ...data, 
            highlighted: true,
            size: data.size as number + (nodeIsHovered ? 2 : 1),
          };
        }

        // if current reducer node is selected or hovered, apply styles
        if (nodeIsSelected && nodeIsHovered) return { ...data, highlighted: true, size: 7 };
        if (nodeIsSelected) return { ...data, highlighted: true, size: 6 };
        if (nodeIsHovered) return { ...data, highlighted: true, size: (data.size as number) + 1 };
        
        // if (hoveredNode && graph.neighbors(hoveredNode).includes(node)) return { ...data, highlighted: true };

        // otherwise, de-emphasize node
        let mutedImage = data.image as string | undefined;

        // pretty hacky! clean up later when improving image handling : )
        if (mutedImage) {
          const i = mutedImage.split('.');
          const first = i[0] as string;

          mutedImage = `${first}_muted.png`;
        }

        return {
          ...data, 
          color: '#E2E2E2',
          image: mutedImage,
          label: null,
          highlighted: false,
          zIndex: 0,
        };
      },
      edgeReducer: (edge: string, data: Attributes): Attributes => {
        // if nothing selected or hovered, hide all edges
        if (!hoveredNode && !selectedNode) return { ...data, hidden: true };

        // check neighbors
        const graph = sigma.getGraph();

        const isSelectedNeighbor = selectedNode && graph.extremities(edge).includes(selectedNode);
        // const isHoveredNeighbor = hoveredNode && graph.extremities(edge).includes(hoveredNode);

        // if it's an edge of a selected node, don't hide
        if (isSelectedNeighbor) return {...data, zIndex: 100};

        return { ...data, hidden: true };
      }
    });
  }, [hoveredNode, selectedNode, setSettings, sigma]);


  return null;
};
