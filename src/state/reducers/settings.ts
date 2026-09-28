import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store';
import type { apiState } from '../../types';

type Credential = { createdAt: number; expiresAt: number };
type Connection = { id: string };
type Consent = { username: string; csrf: string };

const initialState = {
    credential: null as Credential | null,
    csrf: '',
    tokenFetchState: 'idle' as apiState,
    tokenUpdateState: 'idle' as apiState,
    tokenError: '',
    connections: [] as Connection[],
    connectionCsrf: '',
    connectionsFetchState: 'idle' as apiState,
    connectionUpdateState: 'idle' as apiState,
    connectionError: '',
    consent: null as Consent | null,
    consentFetchState: 'idle' as apiState
};

export const fetchTokenSettings = createAsyncThunk('settings/fetchTokenSettings', async () => {
    const response = await fetch('/api/user/api-token', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load API token settings. Reload to try again.');
    return await response.json() as { credential: Credential | null; csrf: string };
}, { condition: (_, { getState }) => (getState() as RootState).settings.tokenFetchState !== 'pending' });

export const fetchExtensionConnections = createAsyncThunk('settings/fetchExtensionConnections', async () => {
    const response = await fetch('/login-extension/connections/data', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load extension connections. Reload to try again.');
    return await response.json() as { connections: Connection[]; csrf: string };
}, { condition: (_, { getState }) => (getState() as RootState).settings.connectionsFetchState !== 'pending' });

export const revokeExtensionConnection = createAsyncThunk('settings/revokeExtensionConnection', async (id: string, { getState }) => {
    const { connectionCsrf: csrf } = (getState() as RootState).settings;
    const response = await fetch('/login-extension/connections', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, csrf })
    });
    if (!response.ok) throw new Error('Could not revoke the connection. Try again or sign in again.');
    return id;
});

export const fetchExtensionConsent = createAsyncThunk('settings/fetchExtensionConsent', async () => {
    const response = await fetch('/login-extension/consent', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load approval.');
    return await response.json() as Consent;
}, { condition: (_, { getState }) => (getState() as RootState).settings.consentFetchState !== 'pending' });

const settings = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        tokenUpdateStarted(state) {
            state.tokenUpdateState = 'pending';
            state.tokenError = '';
        },
        tokenUpdated(state, action: PayloadAction<Credential | null>) {
            state.credential = action.payload;
            state.tokenUpdateState = 'fulfilled';
        },
        tokenUpdateFailed(state) {
            state.tokenUpdateState = 'rejected';
            state.tokenError = 'Could not update your API token. Try again or sign in again.';
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchTokenSettings.pending, state => {
                state.tokenFetchState = 'pending';
                state.credential = null;
                state.csrf = '';
                state.tokenError = '';
            })
            .addCase(fetchTokenSettings.fulfilled, (state, action) => {
                state.credential = action.payload.credential;
                state.csrf = action.payload.csrf;
                state.tokenFetchState = 'fulfilled';
            })
            .addCase(fetchTokenSettings.rejected, (state, action) => {
                state.tokenFetchState = 'rejected';
                state.tokenError = action.error.message;
            })
            .addCase(fetchExtensionConnections.pending, state => {
                state.connectionsFetchState = 'pending';
                state.connections = [];
                state.connectionCsrf = '';
                state.connectionError = '';
            })
            .addCase(fetchExtensionConnections.fulfilled, (state, action) => {
                state.connections = action.payload.connections;
                state.connectionCsrf = action.payload.csrf;
                state.connectionsFetchState = 'fulfilled';
            })
            .addCase(fetchExtensionConnections.rejected, (state, action) => {
                state.connectionsFetchState = 'rejected';
                state.connectionError = action.error.message;
            })
            .addCase(revokeExtensionConnection.pending, state => {
                state.connectionUpdateState = 'pending';
                state.connectionError = '';
            })
            .addCase(revokeExtensionConnection.fulfilled, (state, action) => {
                state.connections = state.connections.filter(connection => connection.id !== action.payload);
                state.connectionUpdateState = 'fulfilled';
            })
            .addCase(revokeExtensionConnection.rejected, (state, action) => {
                state.connectionUpdateState = 'rejected';
                state.connectionError = action.error.message;
            })
            .addCase(fetchExtensionConsent.pending, state => {
                state.consent = null;
                state.consentFetchState = 'pending';
            })
            .addCase(fetchExtensionConsent.fulfilled, (state, action) => {
                state.consent = action.payload;
                state.consentFetchState = 'fulfilled';
            })
            .addCase(fetchExtensionConsent.rejected, state => {
                state.consentFetchState = 'rejected';
            });
    }
});

// Return the one-time secret directly to the caller, without putting it in a Redux action.
export const updateApiToken = (method: 'POST' | 'DELETE') => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(settings.actions.tokenUpdateStarted());
    try {
        const response = await fetch('/api/user/api-token', {
            method, headers: { 'X-CSRF-Token': getState().settings.csrf }
        });
        if (!response.ok) throw new Error('Could not update API token.');
        const credential = method === 'DELETE' ? null : await response.json();
        dispatch(settings.actions.tokenUpdated(credential ? { createdAt: credential.createdAt, expiresAt: credential.expiresAt } : null));
        return credential?.token as string | undefined;
    } catch (error) {
        dispatch(settings.actions.tokenUpdateFailed());
        throw error;
    }
};

export default settings.reducer;
