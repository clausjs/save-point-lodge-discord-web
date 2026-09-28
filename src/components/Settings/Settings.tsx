import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';

import ExtensionConnections from './ExtensionConnections';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { fetchTokenSettings, updateApiToken } from '../../state/reducers/settings';

const Settings: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user.user);
    const userFetchState = useSelector((state: RootState) => state.user.userFetchState);
    const { credential, csrf, tokenFetchState, tokenUpdateState, tokenError } = useSelector((state: RootState) => state.settings);
    const [token, setToken] = useState('');
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState('');
    const busy = tokenFetchState === 'pending' || tokenUpdateState === 'pending';

    useEffect(() => {
        setToken('');
        if (user?.isAdmin) dispatch(fetchTokenSettings());
    }, [user?.id, user?.isAdmin, dispatch]);

    const updateToken = async (method: 'POST' | 'DELETE') => {
        if (credential && !window.confirm(method === 'DELETE' ? 'Revoke your API token?' : 'Replace your API token? Applications using the current token will lose access.')) return;
        setCopied(false); setCopyError('');
        try { setToken(await dispatch(updateApiToken(method)) || ''); }
        catch { /* The reducer exposes the request error. */ }
    };

    const copyToken = async () => {
        try { await navigator.clipboard.writeText(token); setCopied(true); }
        catch { setCopyError('Could not copy the token. Select and copy it from the field.'); }
    };

    if (!user) return <Container sx={{ py: 4 }}>
        {userFetchState === 'pending' || !userFetchState ? <Typography role="status">Loading account…</Typography> : <Button href="/login-discord">Sign in to manage API settings</Button>}
    </Container>;

    return <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>API Settings</Typography>
        {user.isAdmin && <Paper sx={{ p: 3 }}><Stack spacing={2}>
            <Typography variant="h6" component="h2">API token</Typography>
            <Typography>Use a personal token to access the API with your current SPL permissions. Tokens expire after 90 days and remain active when you sign out.</Typography>
            {(tokenError || copyError) && <Alert severity="error">{tokenError || copyError}</Alert>}
            {busy && <Typography role="status">Loading…</Typography>}
            {credential ? <Typography>Expires: {new Date(credential.expiresAt).toLocaleString()}</Typography> : !busy && <Typography>No active API token.</Typography>}
            {token && <>
                <Alert severity="warning">Copy this token now. You cannot view it again after leaving this page. Keep it private.</Alert>
                <TextField label="API token" value={token} multiline InputProps={{ readOnly: true }} />
                <Button onClick={copyToken}>{copied ? 'Copied' : 'Copy token'}</Button>
            </>}
            <Button variant="contained" disabled={busy || !csrf} onClick={() => updateToken('POST')}>{credential ? 'Regenerate token' : 'Generate token'}</Button>
            {credential && <Button color="error" disabled={busy} onClick={() => updateToken('DELETE')}>Revoke token</Button>}
            <Typography variant="body2">Send it as Authorization: Bearer YOUR_TOKEN. Generating a replacement immediately invalidates the previous token.</Typography>
        </Stack></Paper>}
        {/* Initialize session CSRF values in sequence so parallel responses cannot overwrite them. */}
        {(!user.isAdmin || tokenFetchState === 'fulfilled' || tokenFetchState === 'rejected') && <ExtensionConnections />}
    </Container>;
};
export default Settings;
