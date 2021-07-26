import React, { useState } from 'react';

import {
    TablePagination
} from '@material-ui/core';

import { ControlledDisplayTablePaginationProps } from '../../../types';

const DisplayTablePagination = (props: ControlledDisplayTablePaginationProps) => {

    const { rowsPerPageOptions = [5, 10, 15, 20], count, component = "div", changePage } = props;

    const [ page, setPage ] = useState(0);
    const [ perPage, setPerPage ] = useState(props.initialPerPage || rowsPerPageOptions[0]);

    const _onChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, newPage: number) => {
        if (newPage) setPage(newPage);
        changePage(newPage, perPage);
    }

    const _onChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { value } : { value: string } = event.target;

        const numberized: number = Number(value);

        if (!Number.isNaN(numberized)) {
            setPerPage(numberized);
            changePage(page, numberized);
        }
    }

    return (
        <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            //@ts-ignore
            component={component}
            count={count}
            rowsPerPage={perPage}
            page={page}
            onChangePage={_onChangePage}
            onChangeRowsPerPage={_onChangeRowsPerPage}
        />
    );
}

export default DisplayTablePagination;