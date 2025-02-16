import React from 'react';
import { Switch, FormControl, FormControlLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../state/store';
import { toggleLightMode } from '../../../state/reducers/theme';

const ThemeSwitch: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const lightMode: boolean = useSelector((state: RootState) => state.theme.lightMode);

    return (
        <FormControl>
            <FormControlLabel
                control={
                    <Switch
                        checked={!lightMode}
                        onChange={() => dispatch(toggleLightMode())}
                        name="checkedB"
                        color="primary"
                    />
                }
                label="Dark Mode"
            />
        </FormControl>
    );
}

export default ThemeSwitch;