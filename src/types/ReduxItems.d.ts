type CommandOption = {
    name: string;
    description: string;
    required: boolean;
    type: string;
}

export type Command = {
    name: string;
    description: string;
    options?: CommandOption[];
}

export type TabledCommands = {
    [id: string]: Command;
}

export interface BotState {
    commands: Command[];
}

export interface User {
    id: string;
    username: string;
    avatar: string;
    isPlanetExpressMember: boolean;
    isMoviegoer: boolean;
}

interface UserOption {
    value: boolean,
    description: UserOptDescription;
}
interface UserOptions {
    [id: string]: UserOption
}

interface UserOptDescription {
    text: string;
    url: string;
    alt: string;
}

export interface UserState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    user: User | null;
    opts: UserOptions | {};
}

export interface VotableMovie {
    [id: string]: {

    }
}

export interface MovieResult {
    [id: string]: {

    }
}

export interface VotableMovies {
    [id: string]: VotableMovie
}

export interface MovieResults {
    [id: string]: MovieResult;
}

export interface MovieStats {
    movies: MovieResults;
    totalMoviegoers: number | null
}

export interface MovieState {
    votable: VotableMovies;
    stats: MovieStats;
}

export interface Action {
    type: string;
    payload: any
}