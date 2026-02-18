export type ArcItemRarity = string;

export interface ArcGuideLink {
    url: string;
    label: string;
}

export interface ArcMapLocation {
    id: string;
    map: string;
}

export interface ArcStatBlock {
    agility?: number;
    ammo?: string;
    arcStun?: number;
    augmentSlots?: number;
    backpackSlots?: number;
    compatibleWeapons?: string;
    condition?: string;
    damage?: number | null;
    damageMitigation?: number;
    damageMult?: number;
    damagePerSecond?: number;
    durability?: number;
    duration?: number;
    fireRate?: number;
    firingMode?: string;
    healing?: number;
    healingPerSecond?: number;
    healingSlots?: number;
    health?: number;
    illuminationRadius?: number;
    increasedADSSpeed?: number;
    increasedBulletVelocity?: number;
    increasedDurabilityBurnTime?: number;
    increasedEquipTime?: number;
    increasedFireRate?: number;
    increasedRecoilRecoveryTime?: number;
    increasedUnequipTime?: number;
    increasedVerticalRecoil?: number;
    magazineSize?: number;
    movementPenalty?: number;
    movementSpeedModifier?: number;
    projectilesPerShot?: number;
    quality?: number;
    quickUseSlots?: number;
    radius?: number;
    raiderStun?: number;
    range?: number;
    reducedBaseDispersion?: number;
    reducedDispersionRecoveryTime?: number;
    reducedDurabilityBurnRate?: number | null;
    reducedEquipTime?: number;
    reducedMaxShotDispersion?: number;
    reducedNoise?: number;
    reducedPerShotDispersion?: number;
    reducedProjectileDamage?: number;
    reducedRecoilRecoveryTime?: number;
    reducedReloadTime?: number;
    reducedUnequipTime?: number;
    reducedVerticalRecoil?: number;
    safePocketSlots?: number;
    shield?: number;
    shieldCharge?: number;
    shieldCompatibility?: number | string;
    stability?: number;
    stackSize?: number;
    stamina?: number;
    staminaPerSecond?: number;
    stealth?: number | null;
    trinketSlots?: number;
    useTime?: number;
    utilityItemSlots?: number;
    value?: number;
    weight?: number;
    weightLimit?: number;
    weightLimitKg?: number;
    [key: string]: number | string | null | undefined;
}

export interface ArcItemReference {
    id: string;
    icon: string;
    name: string;
    rarity: ArcItemRarity;
    item_type: string;
    description?: string;
}

export interface ArcItemSummary {
    id: string;
    name: string;
    description: string;
    item_type: string;
    loadout_slots: string[];
    icon: string;
    rarity: ArcItemRarity;
    value: number;
    workbench: string | null;
    stat_block: ArcStatBlock;
    flavor_text: string | null;
    subcategory: string | null;
    created_at: string;
    updated_at: string;
    shield_type: string | null;
    loot_area: string | null;
    sources: null;
    ammo_type: string | null;
    locations: ArcMapLocation[];
    guide_links: ArcGuideLink[];
    game_asset_id: number;
}

export interface ArcItemAmount {
    item: ArcItemReference;
    amount: number;
}

export interface ArcItemComponent {
    quantity: number;
    component: ArcItemReference;
}

export interface ArcItemMod {
    mod: ArcItemReference;
}

export interface ArcItemUsage {
    item: ArcItemReference;
    quantity: number;
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
    components: ArcItemComponent[];
    used_in: ArcItemUsage[];
    recycle_components: ArcItemComponent[];
    recycle_from: unknown[];
    mods: ArcItemMod[];
    dropped_by: unknown[];
    sold_by: unknown[];
}
