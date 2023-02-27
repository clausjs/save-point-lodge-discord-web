import React, { useState } from 'react';

import {
    InputAdornment,
    TextField
} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

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