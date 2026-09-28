import React, { useEffect, useState } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';

type Connection = { id: string };
const endpoint = '/login-extension/connections';

const ExtensionConnections: React.FC = () => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [csrf, setCsrf] = useState('');
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    const [signedOut, setSignedOut] = useState(false);

    useEffect(() => {
        let active = true;
        fetch(`${endpoint}/data`, { credentials: 'same-origin', cache: 'no-store' }).then(async response => {
            if (!active) return;
            if (response.status === 401) { setSignedOut(true); return; }
            if (!response.ok) throw new Error('Could not load connections.');
            const data = await response.json();
            if (active) { setConnections(data.connections); setCsrf(data.csrf); }
        }).catch(() => { if (active) setError('Could not load extension connections. Reload to try again.'); })
            .finally(() => { if (active) setBusy(false); });
        return () => { active = false; };
    }, []);

    const revoke = async (id: string) => {
        if (!window.confirm('Revoke this Firefox connection? The extension will need to reconnect.')) return;
        setBusy(true); setError('');
        try {
            const response = await fetch(endpoint, {
                method: 'POST', credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, csrf })
            });
            if (!response.ok) throw new Error('Could not revoke connection.');
            setConnections(current => current.filter(connection => connection.id !== id));
        } catch { setError('Could not revoke the connection. Try again or sign in again.'); }
        finally { setBusy(false); }
    };

    return <Paper sx={{ p: 3, mt: 3 }}><Stack spacing={2}>
        <Typography variant="h6" component="h2">Extension connections</Typography>
        <Typography>Firefox connections can add clips while their SPL login session is active. Revoke a connection to immediately stop its access and automatic renewal.</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {signedOut ? <Button href={endpoint}>Sign in to manage extensions</Button> : <>
            {busy && <Typography role="status">Loading connections…</Typography>}
            {!busy && !error && connections.length === 0 && <Typography>No active extension connections.</Typography>}
            {connections.map(connection => <Stack spacing={1} key={connection.id}>
                <Typography>Firefox · {connection.id.slice(0, 8)}</Typography>
                <Button color="error" disabled={busy || !csrf} onClick={() => revoke(connection.id)} aria-label={`Revoke Firefox connection ${connection.id.slice(0, 8)}`}>Revoke connection</Button>
            </Stack>)}
        </>}
    </Stack></Paper>;
};
export default ExtensionConnections;
