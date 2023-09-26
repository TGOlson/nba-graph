import React from 'react';

import Box from '@mui/joy/Box';

import { NBAGraphNode } from '../../shared/types';
import { Option, OptionSubItem } from './NodeSearch/SearchOption';
import SearchBarBase from './NodeSearch/SearchBarBase';

type NodeSearchProps = {
  nodes: NBAGraphNode[];
  setSelectedNode: (node: string) => void;
};

// Note: this component is seperate from the base component 
// to avoid re-computing options and filters on every input change
const NodeSearch = ({nodes, setSelectedNode}: NodeSearchProps) => {
  const subItemsByRollupId = nodes.reduce<{[key: string]: OptionSubItem[]}>((acc, node) => {
    const attrs = node.attributes;
    if (attrs.rollupId) {
      const prev = acc[attrs.rollupId] ?? [];

      prev.push({
        key: node.key,
        attrs,
      });
      acc[attrs.rollupId] = prev;
    }
    return acc;
  }, {});
    
  const options: Option[] = nodes.filter(x => !x.attributes.rollupId).map((node) => {
    const isPlayer = node.attributes.nbaType === 'player';
    const subItems = subItemsByRollupId[node.key];

    const subItemsSearchArr = subItems?.map(x => x.attrs.label) ?? [];
    const searchString = [...new Set([
      node.attributes.label, 
      isPlayer ? '' : node.key, 
      isPlayer ? '' : node.attributes.nbaType, 
      ...subItemsSearchArr
    ])].join(' ');

    const attrs = node.attributes;
    return {
      key: node.key,
      searchString,
      subItems,
      attrs,
    };
  });

  return (
    <Box sx={{
      top: 0,
      right: 0,
      m: 1,
      position: 'absolute', 
    }}>
      <SearchBarBase options={options} onSelect={setSelectedNode} />
    </Box>
  );
};

export default NodeSearch;
