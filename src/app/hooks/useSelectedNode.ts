import { EventHandlers, useRegisterEvents, useSigma } from "@react-sigma/core";
import { useEffect, useState } from "react";
import { logDebug } from "../util/logger";
import { NBAGraphNode } from "../../shared/types";
import Sigma from "sigma";

type UseSelectedNode = {
  selectedNode: NBAGraphNode | null;
  setSelectedNode: (node: NBAGraphNode | string | null) => void;
};

const getNodeAttributes = (sigma: Sigma, node: string): NBAGraphNode['attributes'] => {
  return sigma.getGraph().getNodeAttributes(node) as NBAGraphNode['attributes'];
};

export const useSelectedNode = (): UseSelectedNode => {
  const sigma = useSigma();

  // for debugging...
  (window as any).sigma = sigma; // eslint-disable-line

  const registerEvents: (eventHandlers: Partial<EventHandlers>) => void = useRegisterEvents();

  const [selectedNode, setSelectedNode] = useState<NBAGraphNode | null>(null);

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        const attributes = getNodeAttributes(sigma, event.node);
        const node = {key: event.node, attributes};
        
        logDebug('Click event', event, 'node', node);
    
        if (selectedNode && selectedNode.key === node.key) {
          setSelectedNode(null);
        } else {
          setSelectedNode(node);
        }
      },
    });
  }, [sigma, registerEvents, selectedNode]);

  const setSelectedNodeFn = (node: NBAGraphNode | string | null) => {
    if (typeof node === 'string') {
      const attributes = getNodeAttributes(sigma, node);
      setSelectedNode({key: node, attributes});
    } else {
      setSelectedNode(node);
    }
  };

  return {
    selectedNode, 
    setSelectedNode: setSelectedNodeFn
  };
};
