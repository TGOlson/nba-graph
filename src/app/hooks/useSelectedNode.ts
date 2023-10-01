import { useEffect, useState } from "react";

import { useSigma } from "@react-sigma/core";
import Sigma from "sigma";
import { SigmaNodeEventPayload } from "sigma/sigma";

import { logDebug } from "../util/logger";
import { NBAGraphNode } from "../../shared/types";

type UseSelectedNode = [
  NBAGraphNode | null,
  (node: NBAGraphNode | string | null) => void,
];

const getNodeAttributes = (sigma: Sigma, node: string): NBAGraphNode['attributes'] => {
  return sigma.getGraph().getNodeAttributes(node) as NBAGraphNode['attributes'];
};

// Note: this is prettttyyyy similar to a normal hook,
// except that multiple instances have the potential to diverge if both calling 'setSelectedNode'
export const useSelectedNode = (): UseSelectedNode => {
  const sigma = useSigma();
  const [selectedNode, setSelectedNode] = useState<NBAGraphNode | null>(null);

  useEffect(() => {
    const handler = (event: SigmaNodeEventPayload) => {
      const attributes = getNodeAttributes(sigma, event.node);
      const node = {key: event.node, attributes};
      
      logDebug('Click event', event, 'node', node);
  
      if (selectedNode && selectedNode.key === node.key) {
        setSelectedNode(null);
      } else {
        setSelectedNode(node);
      }
    };

    sigma.on('clickNode', handler);

    return () => {
      sigma.off('clickNode', handler);
    };
  }, [sigma, selectedNode, setSelectedNode]);

  const setSelectedNodeFn = (node: NBAGraphNode | string | null) => {
    if (typeof node === 'string') {
      const attributes = getNodeAttributes(sigma, node);
      setSelectedNode({key: node, attributes});
    } else {
      setSelectedNode(node);
    }
  };

  return [selectedNode, setSelectedNodeFn];
};
