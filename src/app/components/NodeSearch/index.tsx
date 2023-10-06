import React, { useState } from 'react';

import Autocomplete, { createFilterOptions } from '@mui/joy/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/joy/IconButton';

import { Option, OptionSubItem, BaseSearchOptionProps } from './SearchOption';
import { ListboxComponent } from './ReactWindowAdapters';
import { NBAGraphNode } from '../../../shared/types';

type SearchBarBaseProps = {
  options: Option[];
  onSelect: (id: string) => void;
};

const SearchBarBase = ({options, onSelect}: SearchBarBaseProps) => {
  const [inputValue, setInputValue] = useState('');

  // optionSelected is used to determine if the search popout should be open
  // it mimics the default behavior of the uncontrolled component,
  // but is needed for some special casing with subitems
  const [optionSelected, setOptionSelected] = useState(false);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  
  const [expandedOptions, setExpandedOptions] = useState<{[key: string]: boolean}>({});

  const onSubItemSelect = (subItem: OptionSubItem) => {
    // set input to parent name, acting kinda like we selected the subitem (even thought it's not a real option)
    setInputValue(subItem.attrs.label);
    setOptionSelected(true);
    onSelect(subItem.key);
  };

  const onBlur = () => {
    setFocused(false);
    setExpandedOptions({});
  };

  return (
    <Autocomplete 
      size='lg'
      sx={{ 
        width: {sm: (focused || hovered) ? 320 : 280, xs: 300}, 
        transition: 'width 0.15s ease-in-out',
      }}
      slots={{
        listbox: ListboxComponent,
      }}

      slotProps={{
        input: {
          className: 'node-search-input',
        },
      }}

      onOpen={(_e) => {
        if (optionSelected) setOptionSelected(false);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => onBlur()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      clearOnBlur
      clearOnEscape
      disableListWrap

      placeholder='Search'
      startDecorator={<SearchIcon />}
      open={inputValue.length > 1 && !optionSelected}
      forcePopupIcon={false}

      endDecorator={(
        inputValue.length > 1 
          ? <IconButton size='sm' onClick={() => setInputValue('')}>
              <ClearIcon />
            </IconButton>
          : null
      )}
      
      options={options}
      renderOption={(props, option) => {
        const searchOptionProps: Omit<BaseSearchOptionProps, 'wrapperStyle'> = {
          option, 
          expanded: expandedOptions[option.key] ?? false,
          setExpanded: (expanded: boolean) => setExpandedOptions({...expandedOptions, [option.key]: expanded}),
          onSubItemSelect,
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

      // A couple things to note here...
      // 1. this is a managed component, both for the raw input value, and the selected value
      //    we do this only because it's a nicer UI to clear the search on blur
      //    and there is not an API to do this with the uncontrolled component
      // 2. value is always set to null, so there is never a "selected value" (but there is a free text input string)
      //    this is done solely to provide a better UI for subitem selections
      //    if we actually used a selected value, it would be confusing when toggeling between parent and sub items
      value={null}
      onChange={(_event, value) => {
        if (value) {
          setInputValue(value.attrs.label);
          setOptionSelected(true);
          onSelect(value.key);
        } else {
          console.log('onChange null');
        }
      }}
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
    />
  );
};

type NodeSearchProps = {
  nodes: NBAGraphNode[];
  setSelectedNode: (node: string) => void;
};

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

    return {
      key: node.key,
      searchString,
      subItems,
      attrs: node.attributes,
    };
  });

  return <SearchBarBase options={options} onSelect={setSelectedNode} />;
};

export default NodeSearch;
