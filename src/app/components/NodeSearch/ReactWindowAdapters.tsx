import * as React from 'react';
import { FixedSizeList } from 'react-window';

import { Popper } from '@mui/base/Popper';
import AutocompleteListbox from '@mui/joy/AutocompleteListbox';

import SearchOption, { Option, OptionSubItem } from './SearchOption';
import { getIndex } from '../../../shared/util';

// ***
// Note: all this tom-foolerly below is to make adapters between JoyUI and react-window
// Mostly all copied w/ slight modification from https://mui.com/joy-ui/react-autocomplete/#virtualization
// ***

const LISTBOX_PADDING = 6; // px
const ITEM_SIZE = 58; // px

export type RowData = [
  Omit<React.HTMLAttributes<HTMLLIElement>, 'color'>, 
  Option, 
  (subItem: OptionSubItem) => void
] & React.ReactNode;

export type RenderRowProps = {
  data: RowData[];
  index: number;
  style: React.CSSProperties;
};

const RenderRow = ({ data, index, style }: RenderRowProps) => {
  const [props, option, onSubItemSelect] = data[index] as RowData;

  const autocompleteOptionProps = {
    ...props,
    style: {...style, top: (style.top as number) + LISTBOX_PADDING},
  };

  return (
    <SearchOption
      key={option.key}
      option={option}
      autocompleteOptionProps={autocompleteOptionProps}
      onSubItemSelect={onSubItemSelect}
    />
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

  const itemData = (children as RowData[][])[0] as RowData[];

  return (
    <Popper ref={ref} anchorEl={anchorEl} open={open} modifiers={modifiers}>
      <OuterElementContext.Provider value={other}>
        <FixedSizeList
          itemData={itemData}
          itemKey={index => getIndex(index, itemData)[1].key}
          height={ITEM_SIZE * 8}
          width="100%"
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={ITEM_SIZE}
          overscanCount={5}
          itemCount={itemData.length}
        >
          {RenderRow}
        </FixedSizeList>
      </OuterElementContext.Provider>
    </Popper>
  );
});
