import React from 'react';

import Box from '@mui/joy/Box';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Typography from '@mui/joy/Typography';
import ListItem from '@mui/joy/ListItem';

import SearchOptionImage from './SearchOptionImage';
import { NodeAttributes } from '../../../shared/types';
import { multiYearStr } from '../../../shared/util';

export const OPTION_HEIGHT = 58; // px
export const OPTION_SUBITEM_HEIGHT = 32; // px

export type Option = {
  key: string;
  searchString: string;
  attrs: NodeAttributes;
};

export type BaseSearchOptionProps = {
  option: Option;
  showSubLabel?: boolean;
  wrapperStyle: React.CSSProperties,
  autocompleteOptionProps: Omit<React.HTMLAttributes<HTMLLIElement>, 'color'>, 
};

export type Placeholder = {
  message: string;
  subMessage?: string;
  noImage?: boolean;
};

type SearchOptionProps = Omit<BaseSearchOptionProps, 'option'> & {
  option: Option | Placeholder;
};

export const isPlaceholder = (option: Option | Placeholder): option is Placeholder => {
  return 'message' in option;
};

const getSubLabel = (attrs: NodeAttributes): string => {
  const years = attrs.seasons.map(x => x.year);

  switch (attrs.nbaType) {
    case 'league': return multiYearStr(years);
    case 'franchise': return multiYearStr(years);
    case 'team': return multiYearStr(years);
    case 'player': return multiYearStr(years);
    case 'season': return multiYearStr(years);
    case 'award': return 'Award';
    case 'multi-winner-award': return attrs.label.includes('All-Star') ? (years[0] as number).toString() : multiYearStr(years);
  }
};

// TODO: this is a litttlleeee funky here
// Basically trying to use this as a generic player card
// Probably need to rip that out as a subcomponent, 
// but it's a kinda tricky to do that given how a lot of it relies on being rendered in a list component...
export const SearchOptionPlaceholder = ({option, showSubLabel}: Pick<SearchOptionProps, 'option' | 'showSubLabel'>) => (
  <SearchOption 
    option={option} 
    showSubLabel={showSubLabel}
    autocompleteOptionProps={{className: 'search-option-placeholder'}}
    wrapperStyle={{}}
  />
);

const SearchOption = (props: SearchOptionProps) => {
  const {
    option, 
    showSubLabel = true,
    wrapperStyle,
    autocompleteOptionProps
  } = props;

  const image = isPlaceholder(option) && option.noImage
    ? null
    : <ListItemDecorator sx={{ width: '44px', height: '44px', minInlineSize: '44px'}}>
        {isPlaceholder(option) 
          ? (option.noImage ? null : <SearchOptionImage type='placeholder' />)
          : <SearchOptionImage image={option.attrs.image} crop={option.attrs.crop} borderColor={option.attrs.borderColor}/>
        }
      </ListItemDecorator>;

  return (
    <Box sx={{overflowX: 'auto'}}>
      <ListItem 
        {...autocompleteOptionProps} 
        sx={{...wrapperStyle, height: OPTION_HEIGHT}} 
        slots={{root: AutocompleteOption}} 
      >
        {image}
        <ListItemContent sx={{ fontSize: 'md', ml: 1, width: '100%' }}>
          <Typography level='inherit' noWrap>
            {isPlaceholder(option) ? option.message : option.attrs.name ?? option.attrs.label}
          </Typography>
          {isPlaceholder(option) 
            ? showSubLabel ? <Typography level="body-xs">{option.subMessage}</Typography> : null 
            : showSubLabel ? <Typography level="body-xs">{getSubLabel(option.attrs)}</Typography> : null
          }
        </ListItemContent>
      </ListItem>
    </Box>
  );
};

export default SearchOption;
