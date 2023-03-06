import React from 'react';
import { Switch, FormControl, FormControlLabel } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../reducers';
import { AppDispatch } from '../../../store/configureStore';
import { toggleLightMode } from '../../../actions/themeActions';

const ThemeSwitch: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
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