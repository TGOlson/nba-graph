import React, { useState } from 'react';

import Autocomplete, {createFilterOptions} from '@mui/joy/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';

import { Option, OptionSubItem } from './SearchOption';
import { ListboxComponent } from './ReactWindowAdapters';

type SearchBarBaseProps = {
  options: Option[];
  onSelect: (id: string) => void;
};

const SearchBarBase = ({options, onSelect}: SearchBarBaseProps) => {
  const [inputValue, setInputValue] = useState('');
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const onSubItemSelect = (subItem: OptionSubItem) => {
    // set input to parent name, acting kinda like we selected the subitem (even thought it's not a real option)
    setInputValue(subItem.label);
    onSelect(subItem.key);
  };

  return (
    <Autocomplete 
      sx={{ 
        width: (focused || hovered) ? 300 : 240, 
        transition: 'width 0.15s ease-in-out',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      startDecorator={<SearchIcon />}
      placeholder='Search'
      noOptionsText="No results found"
      clearOnEscape
      disableListWrap
      open={inputValue.length > 1}
      forcePopupIcon={false}
      options={options}
      getOptionLabel={(option) => option.searchString}
      slots={{
        listbox: ListboxComponent,
      }}
      // renderOption={(props, option) => [props, option, onSubItemSelect] as [any, Option, (subItem: OptionSubItem) => void]}
      renderOption={(props, option) => ([props, option, onSubItemSelect] as [any, Option, (subItem: OptionSubItem) => void])}
      // }
      // A couple things to note here...
      // 1. this is a managed component, both for the raw input value, and the selected value
      //    we do this only because it's a nicer UI to clear the search on blur
      //    and there is not an API to do this with the uncontrolled component
      // 2. value is always set to null, so there is never a "selected value" (but there is a free text input string)
      //    this is done solely to provide a better UI for subitem selections
      //    if we actually used a selected value, it would be confusing when toggeling between parent and sub items
      value={null}
      onChange={(_event, value) => {
        if (value) setInputValue(value.label);
        if (value !== null) onSelect(value.key);
      }}
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
      isOptionEqualToValue={(option, value) => option.key === value.key}
      // Not used right now
      // TODO: add back a placeholder?
      // getOptionDisabled={(option) => option.key === 'more_results'}

      // Note: special filter options optimize search a 'lil bit
      // filterOptions={(options, state) => {
      //   if (state.inputValue.length <= 1) return [];

      //   const res = createFilterOptions<Option>()(options, state);
        
      //   const limit = 100;
      //   // const placeholder = {key: 'more_results', label: `...and ${res.length} more...`, image: false} as Option;
      //   return res.length > limit
      //     // slice to limit to first N results
      //     // ? [...res.slice(0, limit), placeholder] 
      //     ? [...res.slice(0, limit)] 
      //     : res;
      // }}
    />
  );
};

export default SearchBarBase;
