import { ClipCategory } from "../components/Soundboard/Categories";

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
    avatarUrl?: string;
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

interface SoundboardOpt {
    description: string;
    enabled?: boolean;
}

export interface SoundboardOptions {
    [id: string]: SoundboardOpt;
}

export interface UserState {
    user: User | null;
    opts: UserOptions | {};
    soundboardOpts: SoundboardOptions | {};
    userFetchState?: apiState;
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
    volume?: number;
    url?: string;
    favoritedBy?: string[];
    category?: ClipCategory;
    duration?: number;
    updatedAt?: Date;
    createdAt?: Date;
}

export type apiState = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export interface SoundboardState {
    clips: Clip[];
    allTags: string[];
    isMyInstants: boolean;
    lastResults: boolean;
    clipFetchState?: apiState;
    clipAddState?: apiState;
    clipEditState?: apiState;
    clipDeleteState?: apiState;
    clipSearchState?: apiState;
}

export interface Action {
    type: string;
    payload: any
}