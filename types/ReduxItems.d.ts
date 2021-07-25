export interface User {
    id: string;
    username: string;
    avatar: string;
    isPlanetExpressMember: boolean;
    isMoviegoer: boolean;
}

interface UserOption {
    [id: string]: boolean;
}
interface UserOptions {
    [id: string]: UserOption
}

interface UserOptDescription {
    text: string;
    url: string;
    alt: string;
}

interface UserOptionsDescriptions {
    [id: string]: UserOptDescription;
}

export interface UserState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    user: User | null;
    opts: UserOptions | {};
    descriptions: UserOptionsDescriptions | {};
}

export interface Action {
    type: string;
    payload: any
}