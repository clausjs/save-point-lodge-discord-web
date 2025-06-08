import React, { useEffect, useState } from 'react';
import { Checkbox, IconButton } from '@mui/material';
import { FilterAlt, FilterAltOff } from '@mui/icons-material';

import SPLMenu, { SPLMenuItem } from '../../shared/Menu/SPLMenu';

interface FilterMenuProps {
    filters: FilterRules[];
    setFilter: (filter: FilterRules) => void;
    disabled?: boolean;
}

export enum FilterRules {
    ALL = 0,
    FAVORITES = 1,
    CREATED = 2,
}

const FilterMenu: React.FC<FilterMenuProps> = ({
    filters,
    setFilter,
    disabled = false
}) => {
    const [ trigger, setTrigger ] = useState<React.ReactNode>();

    const [ items, setItems ] = useState<SPLMenuItem[]>();

    useEffect(() => {
        setTrigger(
            <IconButton disabled={disabled} sx={{ color: 'inherit' }}>
                {filters.length === 1 && filters[0] === FilterRules.ALL ? <FilterAltOff /> : <FilterAlt />}
            </IconButton>
        )

        setItems([
            { node: <span><Checkbox sx={{ color: 'inherit' }} checked={filters.length === 1 && filters[0] === FilterRules.ALL} onChange={() => setFilter(FilterRules.ALL)} />All</span>, onClick: () => setFilter(FilterRules.ALL) },
            { node: <span><Checkbox sx={{ color: 'inherit' }} checked={filters.includes(FilterRules.FAVORITES)} onChange={() => setFilter(FilterRules.FAVORITES)} />Favorites</span>, onClick: () => setFilter(FilterRules.FAVORITES) },
            { node: <span><Checkbox sx={{ color: 'inherit' }} checked={filters.includes(FilterRules.CREATED)} onChange={() => setFilter(FilterRules.CREATED)} />Created By Me</span>, onClick: () => setFilter(FilterRules.CREATED) }
        ]);
    }, [filters, disabled]);

    return (
        <SPLMenu
            trigger={trigger}
            items={items}
            classes='filter-menu'
        />
    )
}

export default FilterMenu;