import { TableCellProps } from '@material-ui/core';

export type TableHeader = {
    label: string;
    class?: string;
} & TableCellProps;

export type TableCell = {
    field?: string;
    class?: string;
    name?: string;
    valueGetter?: (item: any) => JSX.Element | null;
    cellRenderer?: (item: any) => JSX.Element | null;
} & TableCellProps;

type rowItems = {
    [id: string]: any;
}

export interface TableSearchProps {
    searchForResults: Function;
    searchLabel?: string;
    disabled?: boolean;
}

export interface DisplayTablePaginationProps {
    count: number;
    rowsPerPageOptions?: number[];
    initialPerPage?: number;
    component?: string;
}

export type ControlledDisplayTablePaginationProps = {
    changePage: Function;
} & DisplayTablePaginationProps;

export interface DisplayTableProps {
    rowData: rowItems;
    tableHeaders: TableHeader[];
    tableCells: TableCell[];
    filterResults?: (searchText: string) => {};
    tableId?: string;
    itemName?: string;
    searchLabel?: string | false;
    isLoadingData?: boolean;
    paginationProps?: DisplayTablePaginationProps;
}