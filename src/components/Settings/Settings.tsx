import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';

type Credential = { createdAt: number; expiresAt: number; token?: string };
const endpoint = '/api/user/api-token';

const Settings: React.FC = () => {
    const [credential, setCredential] = useState<Credential | null>(null);
    const [csrf, setCsrf] = useState('');
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    const [signedOut, setSignedOut] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let active = true;
        fetch(endpoint, { credentials: 'same-origin', cache: 'no-store' }).then(async response => {
            if (!active) return;
            if (response.status === 401) { setSignedOut(true); return; }
            if (!response.ok) throw new Error('Could not load API token settings.');
            const data = await response.json();
            if (active) { setCredential(data.credential); setCsrf(data.csrf); }
        }).catch(() => { if (active) setError('Could not load API token settings. Reload to try again.'); })
            .finally(() => { if (active) setBusy(false); });
        return () => { active = false; };
    }, []);

    const updateToken = async (method: 'POST' | 'DELETE') => {
        if (credential && !window.confirm(method === 'DELETE' ? 'Revoke your API token?' : 'Replace your API token? Applications using the current token will lose access.')) return;
        setBusy(true); setError(''); setCopied(false);
        try {
            const response = await fetch(endpoint, { method, credentials: 'same-origin', headers: { 'X-CSRF-Token': csrf } });
            if (!response.ok) throw new Error('Could not update your API token. Try again or sign in again.');
            // Keep the secret only in this page's memory; subsequent loads return metadata only.
            setCredential(method === 'DELETE' ? null : await response.json());
        } catch { setError('Could not update your API token. Try again or sign in again.'); }
        finally { setBusy(false); }
    };

    const copyToken = async () => {
        try { await navigator.clipboard.writeText(credential.token); setCopied(true); }
        catch { setError('Could not copy the token. Select and copy it from the field.'); }
    };

    return <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}><Stack spacing={2}>
            <Typography variant="h4" component="h1">Settings</Typography>
            <Typography variant="h6" component="h2">API token</Typography>
            <Typography>Use a personal token to access the API with your current SPL permissions. Tokens expire after 90 days and remain active when you sign out.</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {signedOut ? <Button href="/login-discord">Sign in to manage your token</Button> : <>
                {busy && <Typography role="status">Loading…</Typography>}
                {credential ? <Typography>Expires: {new Date(credential.expiresAt).toLocaleString()}</Typography> : !busy && <Typography>No active API token.</Typography>}
                {credential?.token && <>
                    <Alert severity="warning">Copy this token now. You cannot view it again after leaving this page. Keep it private.</Alert>
                    <TextField label="API token" value={credential.token} multiline InputProps={{ readOnly: true }} />
                    <Button onClick={copyToken}>{copied ? 'Copied' : 'Copy token'}</Button>
                </>}
                <Button variant="contained" disabled={busy || !csrf} onClick={() => updateToken('POST')}>{credential ? 'Regenerate token' : 'Generate token'}</Button>
                {credential && <Button color="error" disabled={busy} onClick={() => updateToken('DELETE')}>Revoke token</Button>}
                <Typography variant="body2">Send it as Authorization: Bearer YOUR_TOKEN. Generating a replacement immediately invalidates the previous token.</Typography>
            </>}
        </Stack></Paper>
    </Container>;
};
export default Settings;
