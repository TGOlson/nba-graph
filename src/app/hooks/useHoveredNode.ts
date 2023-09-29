import { EventHandlers, useRegisterEvents } from "@react-sigma/core";
import { useEffect, useState } from "react";

export const useHoveredNode = (): string | null => {
  const registerEvents: (eventHandlers: Partial<EventHandlers>) => void = useRegisterEvents();

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    registerEvents({
      enterNode: (event) => setHoveredNode(event.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [registerEvents, hoveredNode]);


  return hoveredNode;
};
