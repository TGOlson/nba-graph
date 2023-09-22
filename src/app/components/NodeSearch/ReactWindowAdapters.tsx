import React, { useEffect } from 'react';
import { VariableSizeList } from 'react-window';

import { Popper } from '@mui/base/Popper';
import AutocompleteListbox from '@mui/joy/AutocompleteListbox';
import AutocompleteOption from '@mui/joy/AutocompleteOption';

import SearchOption, { OPTION_HEIGHT, OPTION_SUBITEM_HEIGHT, SearchOptionProps } from './SearchOption';
import { getIndex } from '../../../shared/util';

// ***
// Note: all this tomfoolery below is to make adapters between JoyUI Autocomplete and react-window
// Mostly copied modifications from https://mui.com/joy-ui/react-autocomplete/#virtualization
// ***

const LISTBOX_PADDING = 6; // px

type NoResults = {
  key: string;
  message: string;
};

const isNoResults = (item: SearchOptionProps | NoResults): item is NoResults => {
  return 'message' in item;
};

export type RenderRowProps = {
  data: (SearchOptionProps | NoResults)[];
  index: number;
  style: React.CSSProperties;
};

const RenderRow = ({ data, index, style }: RenderRowProps) => {
  const props = getIndex(index, data);

  const wrapperStyle = {
    ...style, 
    top: (style.top as number) + LISTBOX_PADDING
  }; 

  return isNoResults(props) 
    ? <AutocompleteOption sx={{...wrapperStyle}} className="searchbar-no-options">{props.message}</AutocompleteOption>
    : <SearchOption {...props} wrapperStyle={wrapperStyle} />;
};

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>(function OuterElementTypeComponent(props, ref) {
  const outerProps = React.useContext(OuterElementContext);
  return (
    <AutocompleteListbox
      {...props}
      {...outerProps}
      component="div"
      ref={ref}
      sx={{
        '& ul': {
          padding: 0,
          margin: 0,
          flexShrink: 0,
        },
      }}
    />
  );
});

// Adapter for react-window
type ListboxComponentProps = {
  anchorEl: React.ComponentProps<typeof Popper>['anchorEl'];
  open: boolean;
  modifiers: React.ComponentProps<typeof Popper>['modifiers'];
} & React.HTMLAttributes<HTMLElement>;

export const ListboxComponent = React.forwardRef<HTMLDivElement, ListboxComponentProps>(function ListboxComponent(props, ref) {
  const { children, anchorEl, open, modifiers, ...other } = props;

  const listRef = React.useRef<VariableSizeList>(null);
  const rowDataBase = getIndex(0, (children as (SearchOptionProps | NoResults)[][]));
  const rowData = rowDataBase.length > 0 ? rowDataBase : [{ key: 'no-results', message: 'No results found'}];
  
  // By default react-window does a lot of aggressive caching.
  // Since our list can change in size frequently (options expanding),
  // as well as the number of results from a search, just reset the cache every time row data change.
  // This is pretty frequent, but doesn't seem to cause any performance issues.
  useEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [rowData]);
  
  const getRow = (index: number): SearchOptionProps | NoResults => getIndex(index, rowData);

  const getKey = (index: number): string => {
    const res = getRow(index);
    return isNoResults(res) ? res.key : res.option.key;
  };

  const getRowHeight = (index: number): number => {
    const res = getRow(index);

    if (isNoResults(res)) return OPTION_HEIGHT;

    const { option, expanded } = res;
    const subItemHeight = expanded ? (option.subItems?.length ?? 0) * OPTION_SUBITEM_HEIGHT : 0;

    return OPTION_HEIGHT + subItemHeight;
  };

  return (
    <Popper ref={ref} anchorEl={anchorEl} open={open} modifiers={modifiers}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          ref={listRef}
          itemData={rowData}
          itemKey={getKey}
          height={OPTION_HEIGHT * 8}
          width="100%"
          outerElementType={OuterElementType}
          innerElementType="ul"
          estimatedItemSize={OPTION_HEIGHT}
          itemSize={getRowHeight}
          overscanCount={5}
          itemCount={rowData.length}
        >
          {RenderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </Popper>
  );
});
