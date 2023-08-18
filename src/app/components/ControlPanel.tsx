import React, { useState } from 'react';

import { SerializedNode } from 'graphology-types';

import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Autocomplete, {createFilterOptions} from '@mui/joy/Autocomplete';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import Avatar from '@mui/joy/Avatar';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import { useSigma } from '@react-sigma/core';

type ControlPanelProps = {
  searchableNodes: SerializedNode[];
};

const renderOption = (props: any, node: SerializedNode) => (
  <AutocompleteOption {...props} key={node.key}>
    <ListItemDecorator>
      <Box sx={{
        width: '40px',
        height: '40px',
      }}>
        {node.attributes?.image ? 
          <Box sx={{
            p: 0,
            m: 0,
            transform: 'scale(0.55)',
            transformOrigin: 'left top',
            borderRadius: '50%',
            width: '75px',
            height: '75px',
            background: `url(${node.attributes.image as string}) ${getPosition(node)}`,
          }}/>
          : <Avatar />}
      </Box>
    </ListItemDecorator>
    <ListItemContent sx={{ fontSize: 'md', ml: 1 }}>
      {node.attributes?.label as string}
    </ListItemContent>
  </AutocompleteOption>
);


const getPosition = (node: SerializedNode): string => {
  const { x, y } = node.attributes?.crop as { x: number, y: number };

  return `${-1 * x}px ${-1 * y}px`;
};


const ControlPanel = ({searchableNodes}: ControlPanelProps) => {
  const sigma = useSigma();

  const onSelect = (id: string) => {
    // hacky, but provides a really nice way to trigger a synthetic click event on the graph : )
    (sigma as any)._events.clickNode({node: id, syntheticClickEventFromSearch: true}); // eslint-disable-line
  };
  
  const [value, setValue] = useState<SerializedNode | null>(null);
  const [inputValue, setInputValue] = useState('');

  const sx = {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    top: 0,
    p: 1,
    pl: 2,
    pr: 2,
    position: 'absolute', 
    width: '100vw', 
    zIndex: 1000,
  };

  return (
    <Box sx={sx}>
      <Typography level="title-lg" variant='outlined' sx={{backgroundColor: 'rgba(255, 255, 255, 0.8)'}}>NBA Graph</Typography>
      <Autocomplete 
        sx={{ width: 280 }}
        placeholder="Search..."
        noOptionsText="No results found"
        clearOnEscape
        forcePopupIcon={false}
        options={searchableNodes}
        getOptionLabel={(node) => node.attributes?.label as string}
        renderOption={renderOption}
        // Note: this is a managed component, both for the raw input value, and the selected value
        // we have to do this only because it's a nicer UI to clear the search on blur,
        // and there is not an API to do this with the uncontrolled component
        value={value}
        onChange={(_event, value) => {
          setValue(value);
          if (value !== null) onSelect(value.key);
        }}
        inputValue={inputValue}
        onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
        onBlur={() => setValue(null)}
        filterOptions={createFilterOptions({
          limit: 10, // TODO: for debugging, use infinite scroll later...
        })}
      />
    </Box>
  );
};

export default ControlPanel;
