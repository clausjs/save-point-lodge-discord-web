import React, { useEffect } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { fetchExtensionConnections, revokeExtensionConnection } from '../../state/reducers/settings';

const ExtensionConnections: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user.user);
    const { connections, connectionCsrf, connectionsFetchState, connectionUpdateState, connectionError } = useSelector((state: RootState) => state.settings);
    const busy = connectionsFetchState === 'pending' || connectionUpdateState === 'pending';

    useEffect(() => {
        if (user) dispatch(fetchExtensionConnections());
    }, [user?.id, dispatch]);

    const revoke = (id: string) => {
        if (window.confirm('Revoke this Firefox connection? The extension will need to reconnect.')) {
            dispatch(revokeExtensionConnection(id));
        }
    };

    if (!user) return null;

    return <Paper sx={{ p: 3, mt: 3 }}><Stack spacing={2}>
        <Typography variant="h6" component="h2">Extension connections</Typography>
        <Typography>Firefox connections can add clips while their SPL login session is active. Revoke a connection to immediately stop its access and automatic renewal.</Typography>
        {connectionError && <Alert severity="error">{connectionError}</Alert>}
        {busy && <Typography role="status">Loading connections…</Typography>}
        {!busy && !connectionError && connections.length === 0 && <Typography>No active extension connections.</Typography>}
        {connections.map(connection => <Stack spacing={1} key={connection.id}>
            <Typography>Firefox · {connection.id.slice(0, 8)}</Typography>
            <Button color="error" disabled={busy || !connectionCsrf} onClick={() => revoke(connection.id)} aria-label={`Revoke Firefox connection ${connection.id.slice(0, 8)}`}>Revoke connection</Button>
        </Stack>)}
    </Stack></Paper>;
};
export default ExtensionConnections;
