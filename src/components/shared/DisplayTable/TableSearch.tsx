import React, { useState } from 'react';

import {
    InputAdornment,
    TextField
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import { TableSearchProps } from '../../../types';

const TableSearch = (props: TableSearchProps) => {
    const { searchForResults, searchLabel, searchText, disabled } = props;

    return (
        <div className="table-search">
            <TextField
                label={searchLabel || "Search here"}
                onChange={searchForResults}
                disabled={disabled}
                value={searchText}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end" onClick={props.clearSearch}>
                            <ClearIcon />
                        </InputAdornment>
                    )
                }}
            />
        </div>
    );
};

export default TableSearch;