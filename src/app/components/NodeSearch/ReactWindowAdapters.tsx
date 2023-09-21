import React, { useEffect } from 'react';
import { VariableSizeList } from 'react-window';

import { Popper } from '@mui/base/Popper';
import AutocompleteListbox from '@mui/joy/AutocompleteListbox';

import SearchOption, { OPTION_HEIGHT, OPTION_SUBITEM_HEIGHT, SearchOptionProps } from './SearchOption';
import { getIndex } from '../../../shared/util';

// ***
// Note: all this tomfoolery below is to make adapters between JoyUI Autocomplete and react-window
// Mostly copied modifications from https://mui.com/joy-ui/react-autocomplete/#virtualization
// ***

const LISTBOX_PADDING = 6; // px

export type RowData = SearchOptionProps & React.ReactNode;

export type RenderRowProps = {
  data: RowData[];
  index: number;
  style: React.CSSProperties;
};

const RenderRow = ({ data, index, style }: RenderRowProps) => {
  const props = data[index] as SearchOptionProps;

  const wrapperStyle = {
    ...style, 
    top: (style.top as number) + LISTBOX_PADDING
  }; 

  return (
    <SearchOption {...props} wrapperStyle={wrapperStyle} />
  );
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
  const rowData = (children as RowData[][])[0] as RowData[];
  
  // By default react-window does a lot of aggressive caching.
  // Since our list can change in size frequently (options expanding),
  // as well as the number of results from a search, just reset the cache every time row data change.
  // This is pretty frequent, but doesn't seem to cause any performance issues.
  useEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [rowData]);
  
  const getRow = (index: number): RowData => getIndex(index, rowData);

  const getRowHeight = (index: number): number => {
    const {expanded, option} = getRow(index);

    const subItemHeight = expanded ? (option.subItems?.length ?? 0) * OPTION_SUBITEM_HEIGHT : 0;

    return OPTION_HEIGHT + subItemHeight;
  };

  return (
    <Popper ref={ref} anchorEl={anchorEl} open={open} modifiers={modifiers}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          ref={listRef}
          itemData={rowData}
          itemKey={index => getRow(index).option.key}
          height={OPTION_HEIGHT * 8}
          width="100%"
          outerElementType={OuterElementType}
          innerElementType="ul"
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
