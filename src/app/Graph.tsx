import React, { useEffect } from 'react';
import Graph from "graphology";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";

export const LoadGraph = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();

    graph.addNode("first", { x: 0, y: 0, size: 15, label: "My first node", color: "#FA4F40" });
    graph.addNode("second", { x: 2, y: 2, size: 15, label: "My second node", color: "#FA4F40" });
    graph.addNode("third", { x: 10, y: 10, size: 15, label: "My second node", color: "#FA4F40" });

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

export const DisplayGraph = () => {
  return (
    <SigmaContainer style={{ height: "500px", width: "500px" }}>
      <LoadGraph />
    </SigmaContainer>
  );
};
