// import { Attributes } from 'graphology-types';

// import "@react-sigma/core/lib/react-sigma.min.css";
// import Graph from 'graphology';


//       // TODO: think about intented UI here, kind of messy interactions right now
// export const nodeReducer = (node: string, data: Attributes, graph: Graph): Attributes => {
//   // if nothing selected or hovered, quick return default
//   if (!hoveredNode && !selectedNode) return data;

//   const nodeIsSelected = selectedNode === node;
//   const nodeIsHovered = hoveredNode === node;

//   // if current reducer node is selected or hovered, apply styles
//   if (nodeIsSelected || nodeIsHovered) return { ...data, highlighted: true };
  
//   // check neighbors...
//   // const graph = sigma.getGraph();

//   if (selectedNode && graph.neighbors(selectedNode).includes(node)) {
//     return { 
//       ...data, 
//       highlighted: true,
//     };
//   }
//   if (hoveredNode && graph.neighbors(hoveredNode).includes(node)) return { ...data, highlighted: true };

//   // otherwise, de-emphasize node
//   return {
//     ...data, 
//     color: '#E2E2E2', 
//     label: null,
//     highlighted: false,
//   };
// };

// //       edgeReducer: (edge: string, data: Attributes): Attributes => {
// //         // if nothing selected or hovered, quick return default
// //         if (!hoveredNode && !selectedNode) return data;

// //         // check neighbors
// //         const graph = sigma.getGraph();

// //         const isSelectedNeighbor = selectedNode && graph.extremities(edge).includes(selectedNode);
// //         const isHoveredNeighbor = hoveredNode && graph.extremities(edge).includes(hoveredNode);

// //         if (!isSelectedNeighbor && !isHoveredNeighbor) return { ...data, hidden: true };

// //         return data;
// //       }
// //     });
// //   }, [hoveredNode, selectedNode, setSettings, sigma]);


// //   return null;
// // };
