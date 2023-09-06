import React, { useState } from 'react';
import { useSigma } from '@react-sigma/core';
import { SerializedNode } from 'graphology-types';

import Box from '@mui/joy/Box';
import Autocomplete, {createFilterOptions} from '@mui/joy/Autocomplete';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import Avatar from '@mui/joy/Avatar';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Typography from '@mui/joy/Typography';

import { BaseNodeAttributes, Selection } from '../../shared/types';

type SearchBarProps = {
  nodes: SerializedNode[];
};

type Option = {
  key: string;
  label: string;
  subLabel: string;
  image: {
    src: string;
    crop: Selection;
  } | false;
};

const getOptionImage = (option: Option) => {
  if (option.image === false) return null;

  return (
    <Box sx={{
      p: 0,
      m: 0,
      transform: `scale(${40 / option.image.crop.width})`,
      transformOrigin: 'left top',
      borderRadius: '50%',
      width: `${option.image.crop.width}px`,
      height: `${option.image.crop.height}px`,
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

  const getSubLabel = (node: SerializedNode): string => {
    const typ = node.attributes?.nbaType as string;

    if (typ === 'franchise') return 'Franchise';
    if (typ === 'team') return (node.attributes?.label as string).match(/\d{4}-\d{2}/)?.[0] as string;
    
    // player
    return node.attributes?.years as string;
  };

  // TODO: sort
  // 1. player by name
  // 2. franchise by name
  // 3. team by name / year
  const options = nodes.map((node) => {
    const attrs = node.attributes as BaseNodeAttributes;
    return {
      key: node.key,
      label: attrs.nbaType === 'team' ? attrs.label.match(/.*(?=\s\(\d{4}-\d{2}\))/)?.[0] as string : attrs.label,
      subLabel: getSubLabel(node),
      image: {
        src: attrs.image,
        crop: attrs.crop,
      },
    };
  });

  return (
    <Box sx={sx}>
      <Autocomplete 
        sx={{ width: 300 }}
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
              {option.label}
              <Typography level="body-xs">{option.subLabel}</Typography>
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
