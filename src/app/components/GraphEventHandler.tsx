import { useEffect } from 'react';

import { useCamera, useRegisterEvents } from "@react-sigma/core";
import { useSigma, useSetSettings } from "@react-sigma/core";
import { Attributes } from 'graphology-types';
import { EdgeDisplayData, NodeDisplayData } from 'sigma/types';
import { EdgeAttributes, NBAGraphNode, NodeAttributes } from '../../shared/types';
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

  const setSettings = useSetSettings();
  const registerEvents = useRegisterEvents();
  const { gotoNode } = useCamera();
  const width = useWindowWidth();

  const selectedNode = selectedNodeFull?.key ?? null;

  useEffect(() => {
    if (selectedNode) gotoNode(selectedNode, {duration: 150, easing: 'linear'});
  }, [selectedNode]);


  useEffect(() => {
    const nodeSearchInput = document.querySelector<HTMLInputElement>('.node-search-input');

    registerEvents({
      // Not the most ideal, but here is what we are doing --
      // We want to blur the search input when the user clicks on the graph
      // However, by default *at least* ios safari (maybe other mobile devices) don't blur the input when clicking on the graph
      // Which ends up looking really strange when you are exploring nodes and a prior search is still in the input
      // So just manually clear it... idk could be worse ¯\_(ツ)_/¯
      touchdown: () => {
        if (nodeSearchInput && document.activeElement === nodeSearchInput) {
          nodeSearchInput.blur();
        }
      }
    });
  }, [registerEvents]);

  useEffect(() => {
    setSettings({
      nodeReducer: (node: string, baseData: Attributes): Partial<NodeDisplayData & NodeAttributes> => {
        // A little type cohersion to make typescript happy
        // Note: we mutate this data object below, 
        // this is ok because sigma copys the data object before passing it to the reducer
        const data = baseData as (NodeDisplayData & NodeAttributes);

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
        if ((selectedNode && graph.areNeighbors(selectedNode, node) || (hoveredNode && !selectedNode && graph.areNeighbors(hoveredNode, node)))) {
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
      edgeReducer: (edge: string, baseData: Attributes): Attributes => {
        const data = baseData as (EdgeDisplayData & EdgeAttributes);
        // if nothing selected or hovered, hide all edges

        if (!hoveredNode && !selectedNode) {
          data.zIndex = 0;
          data.hidden = true;
          return data;
        }

        // check neighbors
        const graph = sigma.getGraph();

        // this one is a little tricky...
        // some awards are given to multiple people over multiple years, but don't have nodes differentiating the year (eg. MVP)
        // in the case that year filters are applied, we want to hide the edge if the year is not in the range
        // TODO: this problably signals some sort of problem with the data modeling, maybe later consider tidying this up somehow...
        const edgeAttrs = graph.getEdgeAttributes(edge);
        if (edgeAttrs.nbaType === 'award' && edgeAttrs.year) {
          const year = edgeAttrs.year as number;
          if (!isWithinYearRange(filters, year)) {
            data.hidden = true;
            return data;
          }
        }

        const isSelectedNeighbor = selectedNode && graph.hasExtremity(edge, selectedNode);
        const isHoveredNeighbor = hoveredNode && !selectedNode && graph.hasExtremity(edge, hoveredNode);

        // if a neighbor of selected or hovered, draw edge node
        // only draw edge on hover is there is no selected node
        if (isSelectedNeighbor || isHoveredNeighbor) {
          data.size = 1.6;
          data.hidden = false;
          data.zIndex = 100;
          return data;
        }

        data.hidden = true;
        return data;
      }
    });
  }, [hoveredNode, selectedNode, setSettings, sigma, filters, width]);


  return null;
};

export default GraphEvents;
