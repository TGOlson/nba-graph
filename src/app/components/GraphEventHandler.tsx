import { useEffect, useState } from 'react';

import { EventHandlers, useCamera } from "@react-sigma/core";
import { useSigma, useRegisterEvents, useSetSettings } from "@react-sigma/core";
import { Attributes } from 'graphology-types';

const GraphEvents = () => {
  const sigma = useSigma();
  (window as any).sigma = sigma; // eslint-disable-line

  const setSettings = useSetSettings();
  const registerEvents: (eventHandlers: Partial<EventHandlers>) => void = useRegisterEvents();
  const { gotoNode } = useCamera();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        console.log('click event', event, 'node', sigma.getGraph().getNodeAttributes(event.node));
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

        // if a neighbor of selected or hovered, emphasize node
        // only emphasize on hover is there is no selected node
        if ((selectedNode && graph.neighbors(selectedNode).includes(node) || (hoveredNode && !selectedNode && graph.neighbors(hoveredNode).includes(node)))) {
          return { 
            ...data, 
            highlighted: true,
            size: data.size as number + (nodeIsHovered ? 2 : 1),
          };
        }

        // if current reducer node is selected or hovered, apply styles
        if (nodeIsSelected && nodeIsHovered) return { ...data, highlighted: true, size: data.size as number + 2};
        if (nodeIsSelected) return { ...data, highlighted: true, size: data.size as number + 1};
        if (nodeIsHovered) return { ...data, highlighted: true, size: data.size as number + 1};
        
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
        const isHoveredNeighbor = hoveredNode && !selectedNode && graph.extremities(edge).includes(hoveredNode);

        // if a neighbor of selected or hovered, draw edge node
        // only draw edge on hover is there is no selected node
        if (isSelectedNeighbor || isHoveredNeighbor) return {...data, zIndex: 100};

        return { ...data, hidden: true };
      }
    });
  }, [hoveredNode, selectedNode, setSettings, sigma]);


  return null;
};

export default GraphEvents;
