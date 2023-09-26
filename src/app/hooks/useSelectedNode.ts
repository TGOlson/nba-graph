import { EventHandlers, useRegisterEvents, useSigma } from "@react-sigma/core";
import { useEffect, useState } from "react";
import { SigmaNodeEventPayload } from "sigma/sigma";
import { logDebug } from "../util/logger";
import { NBAGraphNode, NodeAttributes } from "../../shared/types";

type UseSelectedNode = {
  selectedNode: NBAGraphNode | null;
  setSelectedNode: (node: NBAGraphNode | string | null) => void;
  hoveredNode: string | null;
};

export const useSelectedNode = (): UseSelectedNode => {
  const sigma = useSigma();

  // for debugging...
  (window as any).sigma = sigma; // eslint-disable-line

  const registerEvents: (eventHandlers: Partial<EventHandlers>) => void = useRegisterEvents();

  const [selectedNode, setSelectedNode] = useState<NBAGraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    registerEvents({
      clickNode: (baseEvent) => {
        const event = baseEvent as SigmaNodeEventPayload & {syntheticClickEventFromSearch: boolean};

        const attributes = sigma.getGraph().getNodeAttributes(event.node) as NodeAttributes;
        const node = {key: event.node, attributes};
        
        logDebug('Click event', baseEvent, 'node', node);
    
        if (selectedNode && selectedNode.key === node.key && !event.syntheticClickEventFromSearch) {
          setSelectedNode(null);
        } else {
          setSelectedNode(node);
        }
        setHoveredNode(null);
      },
      enterNode: (event) => setHoveredNode(event.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [sigma, registerEvents, selectedNode, hoveredNode]);

  const setSelectedNodeFn = (node: NBAGraphNode | string | null) => {
    if (typeof node === 'string') {
      const attributes = sigma.getGraph().getNodeAttributes(node) as NodeAttributes;
      setSelectedNode({key: node, attributes});
    } else {
      setSelectedNode(node);
    }
  };

  return {
    selectedNode, 
    setSelectedNode: setSelectedNodeFn,
    hoveredNode
  };
};
