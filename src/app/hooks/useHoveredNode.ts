import { useEffect, useState } from "react";

import { useSigma } from "@react-sigma/core";
import { SigmaNodeEventPayload } from "sigma/sigma";

export const useHoveredNode = (): string | null => {
  const sigma = useSigma();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  useEffect(() => {
    const setHandler = (event: SigmaNodeEventPayload) => setHoveredNode(event.node);
    const unsetHandler = (_event: SigmaNodeEventPayload) => setHoveredNode(null);
    
    sigma.on('enterNode', setHandler);
    sigma.on('leaveNode', unsetHandler);

    return () => {
      sigma.off('enterNode', setHandler);
      sigma.off('leaveNode', unsetHandler);
    };
  }, [sigma, setHoveredNode]);


  return hoveredNode;
};
