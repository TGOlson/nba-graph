import React, { useState } from 'react';
import { useSigma } from '@react-sigma/core';

import Box from '@mui/joy/Box';
import Autocomplete, {createFilterOptions} from '@mui/joy/Autocomplete';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Typography from '@mui/joy/Typography';

import { NBAGraphNode, NodeAttributes } from '../../shared/types';
import { multiYearStr } from '../../shared/util';
import { Link, Table } from '@mui/joy';

type SearchBarProps = {
  nodes: NBAGraphNode[];
};

type Option = {
  key: string;
  label: string;
  subLabel: string;
  searchString: string;
  subItems?: {key: string, label: string}[];
  attrs: NodeAttributes;
};

// | {
//   placeholder: true;
//   key: string;
//   label: string;
//   image: string;
// };

// type Option = {
//   key: string;
//   label: string;
//   subLabel: string;
//   image: {
//     src: string;
//     crop: Selection;
//   } | false;
// };

const getOptionImage = (option: Option) => {
  // if (option.image === false) return null;

  return (
    <Box sx={{
      p: 0,
      m: 0,
      transform: `scale(${40 / option.attrs.crop.width})`,
      transformOrigin: 'left top',
      borderRadius: '50%',
      width: `${option.attrs.crop.width}px`,
      height: `${option.attrs.crop.height}px`,
      background: `url(${option.attrs.image}) ${getPosition(option.attrs.crop)}`,
    }}/>
  );
};

const getPosition = ({x, y}: {x: number, y: number}): string => `${-1 * x}px ${-1 * y}px`;


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

function chunks<T>(arr: T[], size: number): T[][] {
  const res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

const SearchBar = ({nodes}: SearchBarProps) => {
  const sigma = useSigma();

  const onSelect = (id: string) => {
    // hacky, but provides a really nice way to trigger a synthetic click event on the graph : )
    (sigma as any)._events.clickNode({node: id, syntheticClickEventFromSearch: true}); // eslint-disable-line
  };
  
  const [value, setValue] = useState<Option | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [openSubItems, setOpenSubItems] = useState<{[key: string]: boolean}>({});

  const sx = {
    top: 0,
    right: 0,
    p: 1,
    pl: 2,
    pr: 2,
    position: 'absolute', 
    zIndex: 1000,
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

  const SubItemDisplay = (subItems: {key: string, label: string}[]) => (
    <Box sx={{ml: 4, borderLeft: '2px solid #CCCCCC'}}>
      <Table 
        borderAxis='none' 
        sx={{"--TableCell-paddingY": "2px", "--TableCell-height": "20px", pl: 1, pr: 2}}
      >
        <tbody>
          {chunks(subItems, 3).map((chunk, i) => (
            <tr key={i}>{chunk.map((subItem) => (
              <td key={subItem.key}>
                <Link
                  color="neutral"
                  level="body-xs"
                  underline="hover"
                  variant="plain"
                  onClick={() => onSelect(subItem.key)}
                >
                  {subItem.label}
                </Link>
              </td>
            ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
    
  const options: Option[] = nodes.filter(x => !x.attributes.rollupId).map((node) => {
    const attrs = node.attributes;
    return {
      key: node.key,
      label: attrs.name ? attrs.name : attrs.label,
      subLabel: getSubLabel(attrs),
      searchString: attrs.label, // TODO: maybe add year, type, etc?
      subItems: subItemsByRollupId[node.key],
      attrs,
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
          <Box key={option.key}>
            <AutocompleteOption {...props} >
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
            {option.subItems && <Link 
              sx={{mt: -2}}
              color="neutral"
              level="body-xs"
              underline="hover"
              variant="plain"
              onClick={(e) => {
                setOpenSubItems({...openSubItems, [option.key]: !openSubItems[option.key]});
                e.preventDefault();
              }}
            >
              <Typography level="body-xs">
                {openSubItems[option.key] ? 'Hide seasons' : 'Show seasons'}
              </Typography>
            </Link>}
            {option.subItems && openSubItems[option.key] ? SubItemDisplay(option.subItems) : null}
          </Box>
        )}
        // Note: this is a managed component, both for the raw input value, and the selected value
        // we have to do this only because it's a nicer UI to clear the search on blur,
        // and there is not an API to do this with the uncontrolled component
        value={value}
        onChange={(_event, value) => {
          setValue(value);
          if (value !== null && !_event.isDefaultPrevented()) onSelect(value.key);
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
          
          const limit = 10;
          // const placeholder = {key: 'more_results', label: `...and ${res.length} more...`, image: false} as Option;
          return res.length > limit
            // slice to limit to first N results
            // ? [...res.slice(0, limit), placeholder] 
            ? [...res.slice(0, limit)] 
            : res;
        }}
      />
    </Box>
  );
};

export default SearchBar;
