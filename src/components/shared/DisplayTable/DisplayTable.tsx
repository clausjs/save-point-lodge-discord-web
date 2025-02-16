import React, { useState, useEffect } from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';

import { ScaleLoader } from 'react-spinners';

// TODO: Use React-Toastify
// import { useSnackbar } from 'notistack';

import './DisplayTable.scss';

import TableSearch from './TableSearch';
import TabbedTablePagination from './DisplayTablePagination';
import { DisplayTableProps } from '../../../types';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
    table: {
        maxHeight: 1000
    }
}));

// const App: React.FC<{ message: string }> = ({ message }) => (
//     <div>{message}</div>
//   );

const DisplayTable: React.FC<DisplayTableProps> = (props) => {
    const classes = useStyles();
    const defaultProps = {
        filterResults: (searchText: string) => (new Promise((resolve, reject) => resolve({})))
    };
    const { tableHeaders, tableCells, rowData, filterResults, 
            itemName, tableId, searchLabel, paginationProps, isLoadingData = false } = props;

    const [ viewing, setViewing ] = useState({});
    const [ search, setSearch ] = useState<string>("");
    const [ filteredData, setFiltering ] = useState({});

    if (props.searchLabel !== false && !props.hasOwnProperty('filterResults')) {
        console.warn("WARNING: Search is enabled, but a filter function was not supplied");
    }

    const generatePages = () => {
        if (paginationProps) {
            setPagination(0, paginationProps.initialPerPage || 5);
            return;
        }

        setViewing(rowData);
    }

    useEffect(() => {
        if (rowData !== null) {
            generatePages();
        }
    }, [tableHeaders, tableCells]);

    useEffect(() => {
        if (tableHeaders.length > 0 && tableCells.length > 0 && Object.keys(rowData).length > 0) {
            setFiltering({});
        }
    }, [rowData]);

    useEffect(() => {
        setSearch("");
        setFiltering({});
    }, [isLoadingData]);

    const setPagination = (page: number, perPage: number) => {

        const _viewing: any = {};

        const itemKeys: string[] = Object.keys(rowData);
        const filteredItemKeys: string[] = Object.keys(filteredData);

        if (filteredItemKeys.length > 0) {
            for (let i = perPage * page; i < filteredItemKeys.length; i++) {
                const id: string = filteredItemKeys[i];
                const item = rowData[id];
    
                if (Object.keys(_viewing).length === perPage) break;
                if (!item) console.warn("Table updating with an empty item"); 
                _viewing[id] = item;
            }
    
            if (process.env.NODE_ENV === 'dev') console.info("SET _viewing: ", _viewing);
            setViewing(_viewing);
        } else {
            for (let i = perPage * page; i < itemKeys.length; i++) {
                const id: string = itemKeys[i];
                const item = rowData[id];
    
                if (Object.keys(_viewing).length === perPage) break;
                _viewing[id] = item;
            }
    
            if (process.env.NODE_ENV === 'dev') console.info("SET _viewing: ", _viewing);
            setViewing(_viewing);
        }

    }

    useEffect(() => {
        generatePages();
    }, [filteredData])

    const searchForResults = async (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { value } = e.target;

        setSearch(value);

        if (value.length >= 3) {
            const filter = filterResults ? filterResults : defaultProps.filterResults;

            try {
                const filters = await filter(search);
                setFiltering(filters);
            } catch (err) {
                console.error("Error filtering results: ", err);
                setFiltering({});
            }
        }
    }

    const _clearSearch = () => {
        setSearch("");
        setFiltering({});
    }

    const getTableBody = () => {
        if (isLoadingData) {
            return (
                <TableRow>
                    <TableCell />
                    <TableCell><div className="table-loading"><ScaleLoader /></div></TableCell>
                    <TableCell />
                </TableRow>
            )
        } else {
            const rows = Object.keys(viewing).map((id, i) => {
                const item = rowData[id];
                let cells = [];

                for (let cellIndex = 0; cellIndex < tableCells.length; cellIndex++) {
                    const cell = tableCells[cellIndex];
                    let content;

                    if (cell.cellRenderer) {
                        if (cell.valueGetter) {
                            const cellContentGenerator = (item: any) => {
                                const value = cell.valueGetter(item);
                                cell.cellRenderer(value);
                            };
                            content = cellContentGenerator(item);
                        } else {
                            content = cell.cellRenderer(item);
                        }
                    } else {
                        if (cell.valueGetter) {
                            content = cell.valueGetter(item);
                        } else {
                            content = item[cell.field];
                        }
                    }


                    cells.push(
                        <TableCell
                            key={`${i}-${cellIndex}`}
                            className={cell.class}
                            size={cell.size}
                            component={cell.component}
                            scope={cell.scope}
                            align={cell.align}
                            title={item.title}
                            padding={cell.padding}
                        >
                            {content}
                        </TableCell>
                    );
                }

                return (
                    <TableRow key={i}>
                        {cells}
                    </TableRow>
                );
            });
            return rows;
        }
    }

    if (rowData) {
        return (
            <div id={tableId} className="data-display-section">
                {searchLabel !== false && <TableSearch disabled={isLoadingData} searchLabel={searchLabel} searchText={search} clearSearch={_clearSearch} searchForResults={searchForResults} />}
                <TableContainer component={Paper} className={classes.table}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {tableHeaders.map((header, i) => {
                                    return (
                                        <TableCell key={i} size={header.size} className={header.class}>{header.label}</TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {getTableBody()}
                        </TableBody>
                    </Table>
                </TableContainer>
                {paginationProps && <TabbedTablePagination {...paginationProps} changePage={setPagination} />}
            </div>
        );
    } else {
        return (
            <div className="no-results">
                <h5>{`Sorry, there are no ${itemName || "items"} for you to view`}</h5>
            </div>
        );
    }
}

export default DisplayTable;