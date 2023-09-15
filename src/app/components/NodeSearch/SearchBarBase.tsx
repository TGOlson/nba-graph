import React, { useState } from 'react';

import Autocomplete, {createFilterOptions} from '@mui/joy/Autocomplete';

import SearchOption, { Option } from './SearchOption';

type SearchBarBaseProps = {
  options: Option[];
  onSelect: (id: string) => void;
};

const SearchBarBase = ({options, onSelect}: SearchBarBaseProps) => {
  const [value, setValue] = useState<Option | null>(null);
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete 
      sx={{ width: 300 }}
      placeholder="Search..."
      noOptionsText="No results found"
      clearOnEscape
      open={inputValue.length > 1}
      forcePopupIcon={false}
      options={options}
      getOptionLabel={({label}) => label}
      renderOption={(props, option) => 
        <SearchOption key={option.key} option={option} onSelect={onSelect} autocompleteOptionProps={props} />
      }
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
  );
};

export default SearchBarBase;
