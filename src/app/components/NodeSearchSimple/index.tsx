import React, { useState } from 'react';

import Autocomplete, { createFilterOptions } from '@mui/joy/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';

import { Option, BaseSearchOptionProps } from './SearchOption';
import { ListboxComponent } from './ReactWindowAdapters';
import { NBAGraphNode } from '../../../shared/types';

type SearchBarBaseProps = {
  defaultValue?: Option | null;
  options: Option[];
  onChange: (id: string | null) => void;
};

// Simplified version of node search with no subitems
// TODO: see if this can be merged with NodeSearch
const SearchBarBase = ({defaultValue, options, onChange}: SearchBarBaseProps) => {
  const [value, setValue] = useState<Option | null>(defaultValue ?? null);

  return (
    <Autocomplete 
      size='lg'
      slots={{
        listbox: ListboxComponent,
      }}
      
      clearOnBlur
      clearOnEscape
      disableListWrap
      
      placeholder='Search'
      startDecorator={<SearchIcon />}
      forcePopupIcon={false}
      
      options={options}
      renderOption={(props, option) => {
        const searchOptionProps: Omit<BaseSearchOptionProps, 'wrapperStyle'> = {
          option, 
          autocompleteOptionProps: props,
        };

        // Funky type cohersion to allow for passing props to adapter functions (as opposed to a true component)
        return searchOptionProps as unknown as React.ReactNode;
      }}
      getOptionLabel={(option) => option.attrs.name ?? option.attrs.label}
      isOptionEqualToValue={(option, value) => option.key === value.key}
      filterOptions={createFilterOptions({
        stringify: (option) => option.searchString,
      })}

      value={value}
      onChange={(_event, value) =>{
        setValue(value);
        onChange(value ? value.key : null);
      }}
    />
  );
};

type NodeSearchSimpleProps = {
  initialNode?: string | null;
  nodes: NBAGraphNode[];
  onChange: (node: string | null) => void;
};

const NodeSearchSimple = ({initialNode, nodes, onChange}: NodeSearchSimpleProps) => {
  const options: Option[] = nodes.map((node) => {
    const isPlayer = node.attributes.nbaType === 'player';

    const searchString = [
      node.attributes.label, 
      isPlayer ? '' : node.key, 
      isPlayer ? '' : node.attributes.nbaType, 
    ].join(' ');

    return {
      key: node.key,
      searchString,
      attrs: node.attributes,
    };
  });

  const defaultValue = initialNode ? options.find((option) => option.key === initialNode) : undefined;

  return <SearchBarBase defaultValue={defaultValue} options={options} onChange={onChange} />;
};

export default NodeSearchSimple;
