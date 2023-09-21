import React from 'react';
import { useSigma } from '@react-sigma/core';

import Box from '@mui/joy/Box';

import { NBAGraphNode, NodeAttributes } from '../../shared/types';
import { multiYearStr } from '../../shared/util';
import { Option, OptionSubItem } from './NodeSearch/SearchOption';
import SearchBarBase from './NodeSearch/SearchBarBase';

type NodeSearchProps = {
  nodes: NBAGraphNode[];
};

const getSubLabel = (attrs: NodeAttributes): string => {
  switch (attrs.nbaType) {
    case 'league': return 'League';
    case 'franchise': return 'Franchise';
    case 'award': return 'Award';
    case 'team': return multiYearStr(attrs.years);
    case 'player': return multiYearStr(attrs.years);
    case 'season': return multiYearStr(attrs.years);
    case 'multi-winner-award': return attrs.label.includes('All-Star') ? (attrs.years[0] as number).toString() : multiYearStr(attrs.years);
  }
};

// Note: this component is seperate from the base component 
// to avoid re-computing options and filters on every input change
const NodeSearch = ({nodes}: NodeSearchProps) => {
  const sigma = useSigma();

  const onSelect = (id: string) => {
    // hacky, but provides a really nice way to trigger a synthetic click event on the graph : )
    (sigma as any)._events.clickNode({node: id, syntheticClickEventFromSearch: true}); // eslint-disable-line
  };

  const subItemsByRollupId = nodes.reduce<{[key: string]: OptionSubItem[]}>((acc, node) => {
    const attrs = node.attributes;
    if (attrs.rollupId) {
      const prev = acc[attrs.rollupId] ?? [];

      prev.push({
        key: node.key,
        label: node.attributes.name ?? node.attributes.label,
        subLabel: getSubLabel(attrs),
      });
      acc[attrs.rollupId] = prev;
    }
    return acc;
  }, {});
    
  const options: Option[] = nodes.filter(x => !x.attributes.rollupId).map((node) => {
    const subItems = subItemsByRollupId[node.key];

    const subItemsSearchArr = subItems?.map(x => x.label) ?? [];
    const searchString = [...new Set([node.attributes.label, ...subItemsSearchArr])].join(' ');

    const attrs = node.attributes;
    return {
      key: node.key,
      label: attrs.name ?? attrs.label,
      subLabel: getSubLabel(attrs),
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
      <SearchBarBase options={options} onSelect={onSelect} />
    </Box>
  );
};

export default NodeSearch;
