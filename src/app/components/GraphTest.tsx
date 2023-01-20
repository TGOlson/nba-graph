import React, { Component } from 'react';
import cytoscape, { NodeSingular } from 'cytoscape';

import { GraphData } from '../api';
import { graphStyle } from './graph-style';

type Props = {
  data: GraphData
};

// const neighborsAndEdges = (node: NodeSingular): [] => {
//   return [...node.neighborhood(), ...node.connectedEdges()]
// }

const removeClassNeighbors = (node: NodeSingular, className: string) => {
  const nodes = node.neighborhood();
  const edges = node.connectedEdges();
    
  node.removeClass(className);
  nodes.removeClass(className);
  edges.removeClass(className);
};

const addClassNeighbors = (node: NodeSingular, className: string) => {
  const nodes = node.neighborhood();
  const edges = node.connectedEdges();

  node.addClass(className);
  nodes.addClass(className);
  edges.addClass(className);
};

export class GraphTest extends Component<Props> {
  graphRef: React.RefObject<HTMLDivElement>;
  
  constructor(props: Props) {
    super(props);

    this.graphRef = React.createRef();
  }

  componentDidMount() {
    const el = this.graphRef.current;
    
    if (!el) throw new Error('Unexpected error not able to find #graph-container');
    
    const nodes = this.props.data.nodes.map(node => {
      return {data: {id: node.key, label: node.attributes?.label as string, val: node.attributes?.size as number, ...node.attributes }};
    });
    
    const edges = this.props.data.edges.map(edge => {
      return {data: {source: edge.source, target: edge.target}};
    });
    
    const graph = cytoscape({
      container: el,
      elements: {
        nodes,
        edges
      },
      motionBlur: true,
      // autoungrabify: true,
      hideEdgesOnViewport: true,
      // autolock: true,
      // textureOnViewport: true,
      style: graphStyle,
      // layout: {
        // name: 'concentric',
        // concentric: (node) => Math.floor(Math.random() * 10)
        // ready: () => console.log('layout ready'),
        // stop: () => console.log('layout stop'),
        // animate: false,
        // numIter: 50,
      // }
    });

    (graph.nodes() as any).panify();

    type State = {
      hovered: NodeSingular | null,
      selected: NodeSingular | null,
    };

    const state: State = {
      hovered: null,
      selected: null,
    };

    graph.nodes().on('mouseover', (e) => {
      const node = e.target as NodeSingular;

      graph.batch(() => {
        if (state.hovered) removeClassNeighbors(state.hovered, 'hovered');
        addClassNeighbors(node, 'hovered');
      });

      state.hovered = node;
    });

    graph.nodes().on('mouseout', (e) => {
      const node = e.target as NodeSingular;

      if (node === state.selected) return;

      graph.batch(() => {
        if (state.hovered) removeClassNeighbors(state.hovered, 'hovered');
      });
    });

    graph.nodes().on('tap', (e) => {
      const node = e.target as NodeSingular;

      graph.batch(() => {
        if (state.selected) removeClassNeighbors(state.selected, 'selected');
        addClassNeighbors(node, 'selected');
      });

      state.selected = node;
    });

    (window as any).graph = graph;

    // graph.layout({
    //   name: 'cose',
    //   ready: () => console.log('layout ready'),
    //   stop: () => console.log('layout stop'),
    //   // numIter: 500,
    // });
  }

  render() {
    return (
      <div style={{width: 800, height: 1000}} ref={this.graphRef}>Hello</div> 
    );
  }
}
