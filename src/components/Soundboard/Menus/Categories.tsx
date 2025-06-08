import React from "react";
import { FormControl, MenuItem, Select } from "@mui/material";

export enum ClipCategory {
    UNCATEGORIZED = 'Uncategorized',
    ANIME = 'Anime',
    GAMES = 'Games',
    MEMES = 'Memes',
    MOVIES_TV = 'Movies/TV',
    MUSIC = 'Music',
    POLITICS = 'Politics',
    PRANKS = 'Pranks',
    REACTIONS = 'Reactions',
    SOUND_EFFECTS = 'Sound Effects',
    SPORTS = 'Sports'
}

export enum MyInstantsCategory {
    ANIME = "Anime & Manga",
    GAMES = "Games",
    MEMES = "Memes",
    MOVIES = "Movies",
    MUSIC = "Music",
    POLITICS = "Politics",
    PRANKS = "Pranks",
    REACTIONS = "Reactions",
    SOUND_EFFECTS = "Sound Effects",
    SPORTS = "Sports",
    TELEVISION = "Television",
    TIKTOK_TRENDS = "TikTok Trends",
    VIRAL = "Viral"
}

export type MyInstantType<T extends MyInstantsCategory | undefined> = 'trending' | 'recent' | T;
const MY_INSTANTS_CATEGORIES: MyInstantType<MyInstantsCategory | undefined>[] = ['trending', 'recent', ...Object.values(MyInstantsCategory)];
export type SavedClipCategory = 'all' | ClipCategory | undefined;


export interface CategorySelectMenuProps {
    category: SavedClipCategory | MyInstantType<MyInstantsCategory | undefined>;
    onChange: (category: SavedClipCategory | MyInstantType<MyInstantsCategory | undefined>) => void;
    isMyInstants?: boolean;
}

const CategorySelectMenu: React.FC<CategorySelectMenuProps> = (props) => {
    const { category, onChange, isMyInstants } = props;
    return (  
        <FormControl className='category-select' variant="standard" fullWidth>
            <Select
                labelId=""
                value={category}
                onChange={(e) => onChange(e.target.value as MyInstantType<MyInstantsCategory | undefined>)}
                label=""
                sx={{ color: 'inherit' }}
            >
                {isMyInstants && MY_INSTANTS_CATEGORIES.map((category, i) => {
                    return (
                        <MenuItem key={i} value={category}>{`${category.substring(0, 1).toUpperCase()}${category.substring(1)}`}</MenuItem>
                    );
                })}
                {!isMyInstants && ['all', ...Object.values(ClipCategory)].map((category, i) => {
                    return (
                        <MenuItem key={i} value={category}>{`${category.substring(0, 1).toUpperCase()}${category.substring(1)}`}</MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    ); 
}

export default CategorySelectMenu;