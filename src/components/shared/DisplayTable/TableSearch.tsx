import React, { useState } from 'react';

import {
    InputAdornment,
    TextField
} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import { TableSearchProps } from '../../../types';

const TableSearch = (props: TableSearchProps) => {
    const { searchForResults, searchLabel, disabled } = props;

    const [ search, setSearch ] = useState("");

    const onSearch = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { value }: { value: string } = event.target;
        setSearch(value);

        if (value && value.length >= 2) searchForResults(value);
    }

    const clearResults = () => {
        setSearch("");
        searchForResults(null);
    }

    return (
        <div className="table-search">
            <TextField
                error={search.length >= 1 && search.length <= 2}
                label={searchLabel || "Search here"}
                onChange={onSearch}
                disabled={disabled}
                value={search}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end" onClick={clearResults}>
                            <ClearIcon />
                        </InputAdornment>
                    )
                }}
            />
        </div>
    );
};

export default TableSearch;