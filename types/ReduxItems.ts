export interface User {
    id: string;
    username: string;
    avatar: string;
    descriminator: string;
    public_flags: number;
    flags: number;
    locale: string;
    mfa_enabled: boolean;
    premium_type: number;
    provider: string;
    guilds: any[];
    isPlanetExpressMember: boolean;
    isMoviegoer: boolean;
    fetchedAt: string;
}

export interface UserState {
    user: User | null;
}

export interface Action {
    type: string;
    payload: any
}