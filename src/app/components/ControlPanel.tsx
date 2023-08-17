import React from 'react';

import { SerializedNode } from 'graphology-types';

import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Autocomplete, {createFilterOptions} from '@mui/joy/Autocomplete';
import { AutocompleteOption, Avatar, ListItemContent, ListItemDecorator } from '@mui/joy';

type ControlPanelProps = {
  searchableNodes: SerializedNode[],
};

export const ControlPanel = ({searchableNodes}: ControlPanelProps) => {
  const sx = {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    p: 1,
    pl: 2,
    pr: 2,
    position: 'absolute', 
    width: '100vw', 
    zIndex: 1000,
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
  };

  // const filterOptions = createFilterOptions({
  //   limit: 10, // TODO: for debugging...
  // });
  console.log(searchableNodes.slice(0, 10));

  return (
    <Box sx={sx}>
      <Typography level="title-lg" variant='outlined' sx={{backgroundColor: 'rgba(255, 255, 255, 0.8)'}}>NBA Graph</Typography>
      <Autocomplete 
        sx={{ width: 280 }}
        // size="sm"
        popupIcon={null}
        placeholder="Search..."
        noOptionsText="No results found"
        options={searchableNodes}
        filterOptions={createFilterOptions({
          limit: 10, // TODO: for debugging, use infinite scroll later...
        })}
        getOptionLabel={(node) => `${node.attributes?.label as string} (${node.key})`}
        // isOptionEqualToValue={(option, value) => option.key === value.key}
        renderOption={(props, node) => (
          <AutocompleteOption {...props}>
            <ListItemDecorator>
              <Avatar
                style={{
                  width: '75px',
                  height: '75px',
                  objectFit: 'none',
                  objectPosition: getPosition(node),
                }}
                src={node.attributes?.image as string}
              />
              {/* {node.attributes?.image ? <Box                
                sx={{
                  p: 0,
                  m: 0,
                  transform: 'scale(0.5)',
                  width: '75px',
                  height: '75px',
                  background: `url(${node.attributes?.image as string}) ${getPosition(node)}`,
                }}
              >
              </Box> : <Avatar />} */}
            </ListItemDecorator>
            <ListItemContent sx={{ fontSize: 'sm' }}>
              {node.attributes?.label as string}
              <Typography level="body-xs">
                ({node.key})
              </Typography>
            </ListItemContent>
          </AutocompleteOption>
        )}
      />
    </Box>
  );
};

const getPosition = (node: SerializedNode): string => {
  const { x, y } = node.attributes?.crop ? node.attributes.crop as { x: number, y: number } : { x: 0, y: 0 };

  const res = `${-1 * x}px ${-1 * y}px`;

  console.log('position', node, res);

  return res;
};
