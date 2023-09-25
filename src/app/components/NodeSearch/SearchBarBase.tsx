import React, { useState } from 'react';

import Autocomplete from '@mui/joy/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';

import { Option, OptionSubItem, SearchOptionProps } from './SearchOption';
import { ListboxComponent } from './ReactWindowAdapters';

type SearchBarBaseProps = {
  options: Option[];
  onSelect: (id: string) => void;
};

const SearchBarBase = ({options, onSelect}: SearchBarBaseProps) => {
  const [inputValue, setInputValue] = useState('');
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [expandedOptions, setExpandedOptions] = useState<{[key: string]: boolean}>({});

  const onSubItemSelect = (subItem: OptionSubItem) => {
    // set input to parent name, acting kinda like we selected the subitem (even thought it's not a real option)
    setInputValue(subItem.attrs.name ?? subItem.attrs.label);
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
      
      onFocus={() => setFocused(true)}
      onBlur={() => onBlur()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}

      clearOnEscape
      disableListWrap
      placeholder='Search'
      startDecorator={<SearchIcon />}
      open={inputValue.length > 1}
      forcePopupIcon={false}
      
      options={options}
      renderOption={(props, option) => {
        const searchOptionProps: Omit<SearchOptionProps, 'wrapperStyle'> = {
          option, 
          expanded: expandedOptions[option.key] ?? false,
          setExpanded: (expanded: boolean) => setExpandedOptions({...expandedOptions, [option.key]: expanded}),
          onSubItemSelect,
          autocompleteOptionProps: props,
        };

        // Funky type cohersion to allow for passing props to adapter functions (as opposed to a true component)
        return searchOptionProps as unknown as React.ReactNode;
      }}
      getOptionLabel={(option) => option.searchString}
      isOptionEqualToValue={(option, value) => option.key === value.key}

      // A couple things to note here...
      // 1. this is a managed component, both for the raw input value, and the selected value
      //    we do this only because it's a nicer UI to clear the search on blur
      //    and there is not an API to do this with the uncontrolled component
      // 2. value is always set to null, so there is never a "selected value" (but there is a free text input string)
      //    this is done solely to provide a better UI for subitem selections
      //    if we actually used a selected value, it would be confusing when toggeling between parent and sub items
      value={null}
      onChange={(_event, value) => {
        if (value) setInputValue(value.attrs.label);
        if (value !== null) onSelect(value.key);
      }}
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
    />
  );
};

export default SearchBarBase;
