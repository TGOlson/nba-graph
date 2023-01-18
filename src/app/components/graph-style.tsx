import cytoscape from 'cytoscape';

export const graphStyle: cytoscape.Stylesheet[] = [
  {
    selector: 'node',
    style: {
      width: '20px',
      height: '20px',
      'background-color': 'lightgrey',
      'z-index': 50,
    }
  }, 
  {
    selector: 'node[image]',
    style: {
      'background-image': 'data(image)',
      'background-image-opacity': 0.3,
      'background-fit': 'contain',
    }
  },
  {
    selector: 'node.selected, node.hovered',
    style: {
      'background-color': 'blue',
      'background-image-opacity': 1,
    }
  },
  {
    selector: 'node.selected, node.hovered',
    style: {
      'font-size': '12px',
      'color': 'black',
      label: 'data(label)',

      'text-border-opacity': 1,
      'text-border-width': 1,
      'text-border-style': 'solid',
      'text-border-color': 'black',

      'text-background-opacity': 1,
      'text-background-color': 'white',
      'text-background-shape': 'roundrectangle',
      'text-background-padding': '3px',
      'z-index': 100,
    }
  },
  {
    selector: 'edge',
    style: {
      display: 'none',
      width: '2px',
      'curve-style': 'haystack'
    }
  }, 
  {
    selector: 'edge.selected, edge.hovered',
    style: {
      display: 'element',
      'line-color': 'grey',
      'z-index': 99,
    }
  }, 
];
