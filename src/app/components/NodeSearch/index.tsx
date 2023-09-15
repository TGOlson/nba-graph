import React from 'react';
import { useSigma } from '@react-sigma/core';

import Box from '@mui/joy/Box';

import { NBAGraphNode, NodeAttributes } from '../../../shared/types';
import { multiYearStr } from '../../../shared/util';
import { Option } from './SearchOption';
import SearchBarBase from './SearchBarBase';

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

const NodeSearch = ({nodes}: NodeSearchProps) => {
  const sigma = useSigma();

  const onSelect = (id: string) => {
    // hacky, but provides a really nice way to trigger a synthetic click event on the graph : )
    (sigma as any)._events.clickNode({node: id, syntheticClickEventFromSearch: true}); // eslint-disable-line
  };

  const subItemsByRollupId = nodes.reduce<{[key: string]: {key: string, label: string}[]}>((acc, node) => {
    const attrs = node.attributes;
    if (attrs.rollupId) {
      const prev = acc[attrs.rollupId] ?? [];

      prev.push({
        key: node.key,
        label: getSubLabel(attrs),
      });
      acc[attrs.rollupId] = prev;
    }
    return acc;
  }, {});
    
  const options: Option[] = nodes.filter(x => !x.attributes.rollupId).map((node) => {
    const attrs = node.attributes;
    return {
      key: node.key,
      label: attrs.name ?? attrs.label,
      subLabel: getSubLabel(attrs),
      subItems: subItemsByRollupId[node.key],
      attrs,
    };
  });

  return (
    <Box sx={{
      top: 0,
      right: 0,
      p: 1,
      pl: 2,
      pr: 2,
      position: 'absolute', 
      zIndex: 1000,
    }}>
      <SearchBarBase options={options} onSelect={onSelect} />
    </Box>
  );
};

export default NodeSearch;
