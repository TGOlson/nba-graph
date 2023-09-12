import { useEffect, useState } from 'react';

import { EventHandlers, useCamera } from "@react-sigma/core";
import { useSigma, useRegisterEvents, useSetSettings } from "@react-sigma/core";
import { Attributes } from 'graphology-types';
import { NodeDisplayData } from 'sigma/types';
import { CustomNodeAttributes, NodeAttributes } from '../../shared/types';
import { GraphFilters } from '../util/types';
import { SigmaNodeEventPayload } from 'sigma/sigma';

type GraphEventsProps = {
  filters: GraphFilters;
};

const isHiddenFromFilters = (filters: GraphFilters, data: NodeAttributes): boolean => {
  if (!filters.showAwards && data.nbaType === 'award') return true;
  if (!filters.showShortCareerPlayers && data.nbaType === 'player') {
    const n = data.years.length;
    const shortCareer = n <= 3 && data.years[n - 1] !== 2023;
    if (shortCareer) return true;
  }

  const leagues = new Set(data.leagues);

  if (!filters.showNBA) leagues.delete('NBA');
  if (!filters.showABA) leagues.delete('ABA');
  if (!filters.showBAA) leagues.delete('BAA');

  if (leagues.size === 0) return true;

  // this is the case only for lifetime awards (e.g. HOF)
  // for these nba types, never filter out based on years
  if (data.years.length === 0) return false;

  const yearsInRange = data.years.some((year) => isWithinYearRange(filters, year));
  if (!yearsInRange) return true;

  return false;
};

const isWithinYearRange = (filters: GraphFilters, year: number): boolean => {
  return year - 1 >= filters.minYear && year - 1 <= filters.maxYear;
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
      clickNode: (baseEvent) => {
        // event is hackily overloaded at one point to include a synthetic click event from the search bar
        // adjust type here to make typescript happy
        const event = baseEvent as SigmaNodeEventPayload & {syntheticClickEventFromSearch: boolean};
        console.log('click event', baseEvent, 'node', sigma.getGraph().getNodeAttributes(event.node));
    
        if (selectedNode === event.node && !event.syntheticClickEventFromSearch) {
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

        const isHidden = isHiddenFromFilters(filters, data);

        if (isHidden) {
          if (selectedNode === node) setSelectedNode(null);
          return { ...data, hidden: true };
        }

        // if nothing selected or hovered, quick return default
        if (!hoveredNode && !selectedNode) return data;

        const nodeIsSelected = selectedNode === node;
        const nodeIsHovered = hoveredNode === node;

        // check neighbors...
        const graph = sigma.getGraph();

        // if a neighbor of selected or hovered, emphasize node
        // only emphasize on hover is there is no selected node
        
        const activeBorderColor = data.nbaType === 'player' ? '#ffffff' : data.borderColor;
        if ((selectedNode && graph.neighbors(selectedNode).includes(node) || (hoveredNode && !selectedNode && graph.neighbors(hoveredNode).includes(node)))) {
          const activeNodeKey = selectedNode ?? hoveredNode;
          const activeNode = graph.getNodeAttributes(activeNodeKey); 
          
          let highlighted = true;
          let muted = false;

          // this one is a little tricky...
          // some awards are given to multiple people over multiple years, but don't have nodes differentiating the year (eg. MVP)
          // in the case that year filters are applied, we want to hide the edge if the year is not in the range
          // TODO: this problably signals some sort of problem with the data modeling, maybe later consider tidying this up somehow...
          if (activeNode.nbaType === 'award' && data.nbaType === 'player') {
            const edge = graph.edge(node, activeNodeKey);            
            const edgeAttrs = graph.getEdgeAttributes(edge);

            if (edgeAttrs.year && !isWithinYearRange(filters, edgeAttrs.year as number)) {
              highlighted = false;
              muted = true;
            }
          }
          
          return { 
            ...data, 
            zIndex: 700,
            highlighted, 
            muted,
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

        // this one is a little tricky...
        // some awards are given to multiple people over multiple years, but don't have nodes differentiating the year (eg. MVP)
        // in the case that year filters are applied, we want to hide the edge if the year is not in the range
        // TODO: this problably signals some sort of problem with the data modeling, maybe later consider tidying this up somehow...
        const edgeAttrs = graph.getEdgeAttributes(edge);
        if (edgeAttrs.nbaType === 'award' && edgeAttrs.year) {
          const year = edgeAttrs.year as number;
          if (!isWithinYearRange(filters, year)) return { ...data, hidden: true };
        }

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
