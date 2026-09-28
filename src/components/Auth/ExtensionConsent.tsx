import React, { useEffect } from 'react';
import { Alert, Button, Container, Paper, Stack, Typography } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { fetchExtensionConsent } from '../../state/reducers/settings';

const ExtensionConsent: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user.user);
    const userFetchState = useSelector((state: RootState) => state.user.userFetchState);
    const { consent, consentFetchState } = useSelector((state: RootState) => state.settings);

    useEffect(() => {
        if (user?.isSoundboardUser) dispatch(fetchExtensionConsent());
    }, [user?.id, user?.isSoundboardUser, dispatch]);

    if (!user) return <Container sx={{ py: 4 }}>
        {userFetchState === 'pending' || !userFetchState ? <Typography role="status">Loading account…</Typography> : <Button href="/login-discord">Sign in to connect Firefox</Button>}
    </Container>;
    if (!user.isSoundboardUser) return <Container sx={{ py: 4 }}><Alert severity="error">You must have soundboard access to connect Firefox.</Alert></Container>;

    return <Container maxWidth="sm" sx={{ py: 4 }}><Paper sx={{ p: 3 }}><Stack spacing={2}>
        <Typography variant="h4" component="h1">Connect Firefox</Typography>
        {consentFetchState === 'rejected' ? <Alert severity="error">This login could not be approved. Start again from Firefox settings and check your soundboard access.</Alert> : !consent ? <Typography role="status">Loading approval…</Typography> : <>
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
