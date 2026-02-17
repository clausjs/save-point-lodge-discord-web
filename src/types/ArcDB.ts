export type ArcItemRarity = string | null;

export interface ArcStatBlock {
    stackSize?: number;
    weight?: number;
    [key: string]: number | string | null | undefined;
}

export interface ArcItemSummary {
    id: string;
    name: string;
    description?: string;
    item_type?: string;
    loadout_slots?: string[];
    icon?: string;
    rarity?: ArcItemRarity;
    value?: number;
    workbench?: string | null;
    stat_block?: ArcStatBlock;
    flavor_text?: string | null;
    subcategory?: string | null;
    created_at?: string;
    updated_at?: string;
    shield_type?: string | null;
    loot_area?: string | null;
    sources?: unknown;
    ammo_type?: string | null;
    locations?: string[];
    guide_links?: string[];
    game_asset_id?: number;
}

export interface ArcItemAmount {
    item: ArcItemSummary;
    amount: number;
}

export interface ArcItemComponent {
    quantity: number;
    component: ArcItemSummary;
}

export interface ArcStation {
    id?: string;
    name?: string;
    tier?: number;
}

export interface ArcCraftingRequirement {
    outputAmount: number;
    requiredItems: ArcItemAmount[];
    station?: ArcStation;
}

export interface ArcStationRequirement {
    amount: number;
    station: ArcStation;
}

export interface ArcItemDetail extends ArcItemSummary {
    components?: ArcItemComponent[];
    used_in?: {
        item: ArcItemSummary & { description?: string };
        quantity: number;
    }[];
}
