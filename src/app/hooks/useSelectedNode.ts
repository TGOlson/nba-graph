import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { useSigma } from "@react-sigma/core";
import Sigma from "sigma";
import { SigmaNodeEventPayload } from "sigma/sigma";

import { logDebug } from "../util/logger";
import { NBAGraphNode } from "../../shared/types";

export const hasNode = (sigma: Sigma, node: string): boolean => {
  return sigma.getGraph().hasNode(node);
};

export const getNodeAttributes = (sigma: Sigma, node: string): NBAGraphNode['attributes'] => {
  return sigma.getGraph().getNodeAttributes(node) as NBAGraphNode['attributes'];
};

const nodeToParam = (sigma: Sigma, node: string): string => {
  const {nbaType} = getNodeAttributes(sigma, node);

  if (nbaType === 'player') return node;
  if (nbaType === 'award' || nbaType === 'multi-winner-award') return node.toLowerCase().replace(/_/g, '-');

  // keep team/franchise/league/season uppercase
  return node.replace(/_/g, '-');
};

const paramToNode = (sigma: Sigma, param: string): string | null => {
  const playerNode = param;
  const otherNode = param.toUpperCase().replace(/-/g, '_');

  if (hasNode(sigma, playerNode)) return playerNode;
  if (hasNode(sigma, otherNode)) return otherNode;

  return null;
};

export const useSelectedNode = (): [string | null, (nodeId: string | null) => void] => {
  const navigate = useNavigate();
  const params = useParams();
  const sigma = useSigma();

  const paramNodeId = params.nodeId;

  const [selectedNode, _setSelectedNodeInternal] = useState<string | null>(() => {
    return paramNodeId ? paramToNode(sigma, paramNodeId) : null;
  });

  useEffect(() => {
    const node = paramNodeId ? paramToNode(sigma, paramNodeId) : null;

    if (node) {
      _setSelectedNodeInternal(node);
    } else {
      navigate('/graph');
      _setSelectedNodeInternal(null);
    }
  }, [paramNodeId]);

  const setSelectedNode = (node: string | null) => {
    if (node) {
      const param = nodeToParam(sigma, node);
      navigate(`/graph/${param}`);
    } else {
      navigate('/graph');
    }
  };

  useEffect(() => {
    const handler = (event: SigmaNodeEventPayload) => {
      const attributes = getNodeAttributes(sigma, event.node);
      const node = {key: event.node, attributes};
      
      logDebug('Click event', event, 'node', node);
  
      if (selectedNode === event.node) {
        setSelectedNode(null);
      } else {
        setSelectedNode(event.node);
      }
    };

    sigma.on('clickNode', handler);

    return () => {
      sigma.off('clickNode', handler);
    };
  }, [sigma, selectedNode, setSelectedNode]);

  return [selectedNode, setSelectedNode];
};
