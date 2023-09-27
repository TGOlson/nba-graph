import { useEffect } from 'react';

import { useCamera } from "@react-sigma/core";
import { useSigma, useSetSettings } from "@react-sigma/core";
import { Attributes } from 'graphology-types';
import { NodeDisplayData } from 'sigma/types';
import { NBAGraphNode, NodeAttributes } from '../../shared/types';
import { GraphFilters } from '../util/types';
import { getIndex } from '../../shared/util';
import { useWindowWidth } from '@react-hook/window-size';

type GraphEventsProps = {
  filters: GraphFilters;
  selectedNode: NBAGraphNode | null;
  setSelectedNode: (node: NBAGraphNode | null) => void;
  hoveredNode: string | null;
};

export const isVisibleNode = (filters: GraphFilters, {seasons, nbaType}: NodeAttributes): boolean => {
  if (!filters.awards && (nbaType === 'award' || nbaType === 'multi-winner-award')) return false;

  if (!filters.shortCareerPlayers && nbaType === 'player') {
    const n = seasons.length;
    const shortCareer = n <= 3 && getIndex(n - 1, seasons).year !== 2023;
    if (shortCareer) return false;
  }

  return seasons.some((season) => {
    return filters.leagues[season.leagueId] && isWithinYearRange(filters, season.year);
  });
};

const isWithinYearRange = (filters: GraphFilters, year: number): boolean => {
  return year >= filters.minYear && year <= filters.maxYear;
};

const GraphEvents = ({filters, selectedNode: selectedNodeFull, setSelectedNode, hoveredNode}: GraphEventsProps) => {
  const sigma = useSigma();
  (window as any).sigma = sigma; // eslint-disable-line

  const width = useWindowWidth();

  const setSettings = useSetSettings();
  const { gotoNode } = useCamera();

  const selectedNode = selectedNodeFull?.key ?? null;

  useEffect(() => {
    if (selectedNode) gotoNode(selectedNode, {duration: 250});
  }, [selectedNode]);

  useEffect(() => {
    setSettings({
      nodeReducer: (node: string, baseData: Attributes): Partial<NodeDisplayData & NodeAttributes> => {
        // a little type cohersion to make typescript happy
        // copy node data and then mutate below...
        // makes iterative updates below easier
        const data = {...baseData} as (NodeDisplayData & NodeAttributes);

        // On screens smaller than 600px, scale down the nodes
        // Otherwise sigma resizes itself and gets too smushed and hard to read
        const nodeSizeScalingFactor = Math.min(1, width / 600);
        data.size = data.size * nodeSizeScalingFactor;

        if (!isVisibleNode(filters, data)) {
          if (selectedNode === node) setSelectedNode(null);
          data.hidden = true;
          return data;
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
          if ((activeNode.nbaType === 'award' && data.nbaType === 'player') || (activeNode.nbaType === 'player' && data.nbaType === 'award')) {
            const edge = graph.edge(activeNode.nbaType === 'award' ? node : activeNodeKey, activeNode.nbaType === 'award' ? activeNodeKey : node);            
            const edgeAttrs = graph.getEdgeAttributes(edge);

            if (edgeAttrs.year && !isWithinYearRange(filters, edgeAttrs.year as number)) {
              highlighted = false;
              muted = true;
            }
          }

          data.zIndex = 700;
          data.highlighted = highlighted;
          data.muted = muted;
          data.borderColor = activeBorderColor;
          data.size = data.size + (nodeIsHovered ? 2 : 1);
          return data;
        }

        // if current reducer node is selected or hovered, apply styles
        if (nodeIsSelected && nodeIsHovered) {
          data.zIndex = 1000;
          data.highlighted = true;
          data.borderColor = activeBorderColor;
          data.size = data.size + 4;
          return data;
        }
        if (nodeIsSelected) {
          data.zIndex = 900;
          data.highlighted = true;
          data.borderColor = activeBorderColor;
          data.size = data.size + 3;
          return data;
        }
        if (nodeIsHovered) {
          data.zIndex = 800;
          data.highlighted = true;
          data.borderColor = activeBorderColor;
          data.size = data.size + 1;
          return data;
        }

        data.muted = true;
        data.highlighted = false;
        data.zIndex = 0;
        return data;
      },
      edgeReducer: (edge: string, data: Attributes): Attributes => {
        // if nothing selected or hovered, hide all edges
        if (!hoveredNode && !selectedNode) return { ...data, zIndex: 0, hidden: true };

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
        if (isSelectedNeighbor || isHoveredNeighbor) return {...data, size: 1.6, hidden: false, zIndex: 100};

        return { ...data, hidden: true };
      }
    });
  }, [hoveredNode, selectedNode, setSettings, sigma, filters, width]);


  return null;
};

export default GraphEvents;
