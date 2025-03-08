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
    private?: boolean;
    type: number;
}

export type TabledCommands = {
    [id: string]: Command;
}

export interface CommandState {
    commands: Command[];
}

export interface User {
    id: string;
    username: string;
    avatar: string;
    isPlanetExpressMember: boolean;
    isSoundboardUser: boolean;
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
    user: User | null;
    opts: UserOptions | {};
}

export interface VotableMovie {
    author: string;
    plus: number;
    posted: Date;
    poster: string;
    title: string;
    voted: {
        [id: string]: boolean;
    };
    watched: boolean;
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

export interface DiscordState {
    members: DiscordUser[];
}

export interface DiscordUser {
    id: string;
    username: string;
    discriminator: number;
    avatar: string;
    status: string;
    game?: any
    avatar_url: string;
}

export interface Clip {
    id: string;
    name: string;
    tags: string[];
    description: string;
    uploadedBy: string;
    playCount?: number;
    url?: string;
    favoritedBy?: string[];
    updatedAt?: Date;
    createdAt?: Date;
}

export type apiState = 'pending' | 'fulfilled' | 'rejected';

export interface SoundboardState {
    clips: Clip[];
    isMyInstants: boolean;
    clipFetchState?: apiState;
    clipAddState?: apiState;
    clipEditState?: apiState;
    clipDeleteState?: apiState;
}

export interface Action {
    type: string;
    payload: any
}