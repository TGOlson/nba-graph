import { useEffect, useState } from 'react';

import { EventHandlers, useCamera } from "@react-sigma/core";
import { useSigma, useRegisterEvents, useSetSettings } from "@react-sigma/core";
import { Attributes } from 'graphology-types';
import { NodeDisplayData } from 'sigma/types';
import { CustomNodeAttributes, NodeAttributes } from '../../shared/types';
import { GraphFilters } from '../util/types';

type GraphEventsProps = {
  filters: GraphFilters;
};

const GraphEvents = ({filters}: GraphEventsProps) => {
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
      nodeReducer: (node: string, baseData: Attributes): Partial<NodeDisplayData & CustomNodeAttributes> => {
        // a little type cohersion to make typescript happy
        const data = baseData as NodeAttributes;

        if (!filters.showAwards && data.nbaType === 'award') return { ...data, hidden: true };
        if (!filters.showShortCareerPlayers && data.nbaType === 'player' && data.years.length <= 3) return { ...data, hidden: true };

        // if nothing selected or hovered, quick return default
        if (!hoveredNode && !selectedNode) return data;

        const nodeIsSelected = selectedNode === node;
        const nodeIsHovered = hoveredNode === node;

        // check neighbors...
        const graph = sigma.getGraph();
        // const selectedNe = graph.neighbors(selectedNode);

        // console.log(data);
        // if a neighbor of selected or hovered, emphasize node
        // only emphasize on hover is there is no selected node
        const activeBorderColor = data.nbaType === 'player' ? '#ffffff' : data.borderColor;
        if ((selectedNode && graph.neighbors(selectedNode).includes(node) || (hoveredNode && !selectedNode && graph.neighbors(hoveredNode).includes(node)))) {
          return { 
            ...data, 
            zIndex: 700,
            highlighted: true, 
            borderColor: activeBorderColor,
            size: data.size + (nodeIsHovered ? 2 : 1),
          };
        }

        // if current reducer node is selected or hovered, apply styles
        if (nodeIsSelected && nodeIsHovered) return { ...data, zIndex: 1000, highlighted: true, borderColor: activeBorderColor, size: data.size + 4};
        if (nodeIsSelected) return { ...data, zIndex: 900, highlighted: true, borderColor: activeBorderColor, size: data.size + 3};
        if (nodeIsHovered) return { ...data, zIndex: 800, highlighted: true, borderColor: activeBorderColor, size: data.size + 1};

        return {
          ...data, 
          muted: true,
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
        if (isSelectedNeighbor || isHoveredNeighbor) return {...data, size: 1.2, hidden: false, zIndex: 100};

        return { ...data, hidden: true };
      }
    });
  }, [hoveredNode, selectedNode, setSettings, sigma, filters]);


  return null;
};

export default GraphEvents;
