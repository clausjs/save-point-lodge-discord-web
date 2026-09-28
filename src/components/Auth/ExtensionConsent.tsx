import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, Paper, Stack, Typography } from '@mui/material';

type Consent = { username: string; csrf: string };

const ExtensionConsent: React.FC = () => {
    const [consent, setConsent] = useState<Consent | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        fetch('/login-extension/consent', { credentials: 'same-origin', cache: 'no-store' }).then(async response => {
            if (!response.ok) throw new Error('Could not load approval.');
            const data = await response.json();
            if (active) setConsent(data);
        }).catch(() => { if (active) setError('This login could not be approved. Start again from Firefox settings and check your soundboard access.'); });
        return () => { active = false; };
    }, []);

    return <Container maxWidth="sm" sx={{ py: 4 }}><Paper sx={{ p: 3 }}><Stack spacing={2}>
        <Typography variant="h4" component="h1">Connect Firefox</Typography>
        {error ? <Alert severity="error">{error}</Alert> : !consent ? <Typography role="status">Loading approval…</Typography> : <>
            <Typography>Allow the Savepoint Lodge Firefox extension to add clips as <strong>{consent.username}</strong>?</Typography>
            <Typography>This connection can only add clips. It renews while this SPL session is active and cannot edit, delete, or play clips. You can revoke it in Settings.</Typography>
            {/* Native navigation lets the server redirect the PKCE code to Firefox's fixed callback. */}
            <form method="post" action="/login-extension/confirm">
                <input type="hidden" name="csrf" value={consent.csrf} />
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" type="submit" name="decision" value="allow">Connect Firefox</Button>
                    <Button type="submit" name="decision" value="deny">Cancel</Button>
                </Stack>
            </form>
        </>}
    </Stack></Paper></Container>;
};
export default ExtensionConsent;
