import React, { useState } from 'react';
import { useSigma } from '@react-sigma/core';
import { SerializedNode } from 'graphology-types';

import Box from '@mui/joy/Box';
import Autocomplete, {createFilterOptions} from '@mui/joy/Autocomplete';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import Avatar from '@mui/joy/Avatar';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import { Typography } from '@mui/joy';

type SearchBarProps = {
  nodes: SerializedNode[];
};

type Option = {
  key: string;
  label: string;
  nbaType: 'player' | 'team' | 'franchise';
  years?: string;
  image: {
    src: string;
    crop: {
      x: number;
      y: number;
    };
  } | false | undefined;
};

const getOptionImage = (option: Option) => {
  if (option.image === false) return null;
  if (option.image === undefined) return <Avatar />;

  return (
    <Box sx={{
      p: 0,
      m: 0,
      transform: 'scale(0.55)',
      transformOrigin: 'left top',
      borderRadius: '50%',
      width: '75px',
      height: '75px',
      background: `url(${option.image.src}) ${getPosition(option.image.crop)}`,
    }}/>
  );
};

const getPosition = ({x, y}: {x: number, y: number}): string => `${-1 * x}px ${-1 * y}px`;

const SearchBar = ({nodes}: SearchBarProps) => {
  const sigma = useSigma();

  const onSelect = (id: string) => {
    // hacky, but provides a really nice way to trigger a synthetic click event on the graph : )
    (sigma as any)._events.clickNode({node: id, syntheticClickEventFromSearch: true}); // eslint-disable-line
  };
  
  const [value, setValue] = useState<Option | null>(null);
  const [inputValue, setInputValue] = useState('');

  const sx = {
    top: 0,
    right: 0,
    p: 1,
    pl: 2,
    pr: 2,
    position: 'absolute', 
    zIndex: 1000,
  };

  // TODO: sort by last name
  const options = nodes.map((node) => ({
    key: node.key,
    label: node.attributes?.label as string,
    nbaType: node.attributes?.nbaType as 'player' | 'team' | 'franchise',
    years: node.attributes?.years as string,
    image: node.attributes?.image ? {
      src: node.attributes.image as string,
      crop: node.attributes.crop as { x: number, y: number },
    } : undefined,
  }));

  return (
    <Box sx={sx}>
      <Autocomplete 
        sx={{ width: 280 }}
        placeholder="Search..."
        noOptionsText="No results found"
        clearOnEscape
        open={inputValue.length > 1}
        forcePopupIcon={false}
        options={options}
        getOptionLabel={({label}) => label}
        renderOption={(props, option) => (
          <AutocompleteOption {...props} key={option.key}>
            <ListItemDecorator>
              <Box sx={{ width: '40px', height: '40px'}}>
                {getOptionImage(option)}
              </Box>
            </ListItemDecorator>
            <ListItemContent sx={{ fontSize: 'md', ml: 1 }}>
              {option.nbaType === 'team' ? option.label : null}
              {option.nbaType !== 'team' ? option.label : null}
              <Typography level="body-xs">
                {option.nbaType === 'team' ? <Typography level="body-xs" variant="soft">Team</Typography> : null}
                {option.nbaType === 'franchise' ? <Typography level="body-xs" variant="soft">Franchise</Typography> : null}
                {option.nbaType === 'player' ? <Typography level="body-xs">{option.years}</Typography> : null}
              </Typography>
            </ListItemContent>
          </AutocompleteOption>
        )}
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
        isOptionEqualToValue={(option, value) => option.key === value.key}
        getOptionDisabled={(option) => option.key === 'more_results'}

        // Note: special filter options optimize search a 'lil bit
        filterOptions={(options, state) => {
          if (state.inputValue.length <= 1) return [];

          const res = createFilterOptions<Option>()(options, state);
          
          return res.length > 100
            // slice to limit to first 100 results
            ? [...res.slice(0, 100), {key: 'more_results', label: `...and ${res.length} more...`, image: false} as Option] 
            : res;
        }}
      />
    </Box>
  );
};

export default SearchBar;
