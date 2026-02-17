import React, { useEffect, useMemo, useState } from 'react';
import {
    Autocomplete,
    Breadcrumbs,
    Button,
    Chip,
    CircularProgress,
    Container,
    TextField
} from '@mui/material';

import './ArcWorkbench.scss';
import { ArcCraftingRequirement, ArcItemDetail, ArcItemSummary } from '../../types';

const arcImageBaseUrl = 'https://ardb.app/static';

const ArcWorkbench: React.FC = () => {
    const [ items, setItems ] = useState<ArcItemSummary[]>([]);
    const [ itemsLoading, setItemsLoading ] = useState<boolean>(false);
    const [ itemsError, setItemsError ] = useState<string>('');

    const [ selectedItemId, setSelectedItemId ] = useState<string | null>(null);
    const [ selectedItem, setSelectedItem ] = useState<ArcItemDetail | null>(null);
    const [ itemLoading, setItemLoading ] = useState<boolean>(false);
    const [ itemError, setItemError ] = useState<string>('');
    const [ breadcrumbIds, setBreadcrumbIds ] = useState<string[]>([]);
    const [ itemDetailCache, setItemDetailCache ] = useState<Record<string, ArcItemDetail>>({});

    const [ quantity, setQuantity ] = useState<number>(1);

    useEffect(() => {
        let isMounted = true;
        const loadItems = async () => {
            setItemsLoading(true);
            setItemsError('');
            try {
                const response = await fetch('/api/arcdb/items');
                if (!response.ok) throw new Error('Failed to load items');
                const data: ArcItemSummary[] = await response.json();
                if (isMounted) setItems(data);
            } catch (err) {
                if (isMounted) setItemsError('Unable to load ArcDB items.');
            } finally {
                if (isMounted) setItemsLoading(false);
            }
        };

        loadItems();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (!selectedItemId) {
            setSelectedItem(null);
            return;
        }

        let isMounted = true;
        const loadItem = async () => {
            setItemLoading(true);
            setItemError('');
            try {
                const response = await fetch(`/api/arcdb/items/${selectedItemId}`);
                if (!response.ok) throw new Error('Failed to load item');
                const data: ArcItemDetail = await response.json();
                if (isMounted) setSelectedItem(data);
            } catch (err) {
                if (isMounted) setItemError('Unable to load item details.');
            } finally {
                if (isMounted) setItemLoading(false);
            }
        };

        loadItem();
        return () => { isMounted = false; };
    }, [selectedItemId]);

    const selectedItemSummary = useMemo(() => {
        return items.find((item) => item.id === selectedItemId) || null;
    }, [items, selectedItemId]);

    const getCraftingRequirement = (item?: ArcItemDetail): ArcCraftingRequirement | undefined => {
        if (!item?.components?.length) return undefined;
        return {
            outputAmount: 1,
            requiredItems: item.components.map((component) => ({
                item: component.component,
                amount: component.quantity
            })),
            station: item.workbench ? { name: item.workbench } : undefined
        };
    };

    const crafting = getCraftingRequirement(selectedItem);
    const outputAmount = crafting?.outputAmount || 1;
    const craftsNeeded = Math.ceil(quantity / outputAmount);

    const getCraftsNeeded = (requiredAmount: number, output: number) => {
        if (!output || output < 1) return requiredAmount;
        return Math.ceil(requiredAmount / output);
    };

    const isUpgradeName = (name?: string) => {
        if (!name) return false;
        const match = name.trim().match(/^(.*)\s+(I|II|III|IV|V|VI|VII|VIII|IX|X)$/);
        return Boolean(match);
    };

    const resolveIconUrl = (icon?: string) => {
        if (!icon) return undefined;
        if (icon.startsWith('http')) return icon;
        if (icon.startsWith('/')) return `${arcImageBaseUrl}${icon}`;
        return `${arcImageBaseUrl}/${icon}`;
    };

    const addAggregate = (
        aggregate: Record<string, { item: ArcItemSummary; amount: number }>,
        item: ArcItemSummary,
        amount: number
    ) => {
        if (!aggregate[item.id]) {
            aggregate[item.id] = { item, amount };
        } else {
            aggregate[item.id].amount += amount;
        }
    };

    const buildAggregateMaterials = (
        itemId: string,
        requiredAmount: number,
        visited: Set<string>
    ) => {
        const aggregate: Record<string, { item: ArcItemSummary; amount: number }> = {};
        if (visited.has(itemId)) return aggregate;
        visited.add(itemId);

        const detail = itemDetailCache[itemId];
        const requirement = getCraftingRequirement(detail);
        if (!requirement?.requiredItems?.length) {
            const summary: ArcItemSummary = detail || { id: itemId, name: itemId };
            addAggregate(aggregate, summary, requiredAmount);
            return aggregate;
        }

        const output = requirement.outputAmount || 1;
        const crafts = Math.ceil(requiredAmount / output);

        requirement.requiredItems.forEach((entry) => {
            const needed = entry.amount * crafts;
            const childDetail = itemDetailCache[entry.item.id];
            const childRequirement = getCraftingRequirement(childDetail);
            if (childRequirement?.requiredItems?.length) {
                const childAggregate = buildAggregateMaterials(entry.item.id, needed, new Set(visited));
                Object.values(childAggregate).forEach((value) => {
                    addAggregate(aggregate, value.item, value.amount);
                });
            } else {
                addAggregate(aggregate, entry.item, needed);
            }
        });

        return aggregate;
    };

    const renderUpgradeChain = (
        itemId: string,
        requiredAmount: number,
        depth = 0,
        visited = new Set<string>()
    ): React.ReactNode => {
        if (visited.has(itemId)) return null;
        visited.add(itemId);

        const detail = itemDetailCache[itemId];
        const requirement = getCraftingRequirement(detail);
        if (!requirement?.requiredItems?.length) return null;

        const output = requirement.outputAmount || 1;
        const crafts = Math.ceil(requiredAmount / output);

        return (
            <div className='arc-workbench__upgrade-step' style={{ marginLeft: depth * 12 }}>
                <div className='arc-workbench__upgrade-header'>
                    <div className='arc-workbench__upgrade-title'>Craft {detail.name}</div>
                    <div className='arc-workbench__upgrade-meta'>
                        Need {requiredAmount} • Craft {crafts}x
                    </div>
                </div>
                <div className='arc-workbench__upgrade-items'>
                    {requirement.requiredItems.map((entry) => {
                        const totalAmount = entry.amount * crafts;
                        return (
                            <button
                                key={`${itemId}-${entry.item.id}`}
                                className='arc-workbench__requirement-subcard'
                                onClick={() => handleRequirementClick(entry.item.id)}
                                type='button'
                            >
                                <div className='arc-workbench__requirement-title'>
                                    <div className='arc-workbench__requirement-image'>
                                        <img
                                            src={resolveIconUrl(entry.item.icon)}
                                            alt={entry.item.name}
                                        />
                                    </div>
                                    <div className='arc-workbench__requirement-name'>
                                        {entry.item.name}
                                    </div>
                                </div>
                                <div className='arc-workbench__requirement-meta'>
                                    Base: {entry.amount} • Needed: {totalAmount}
                                </div>
                            </button>
                        );
                    })}
                </div>
                {requirement.requiredItems.map((entry) => {
                    const childDetail = itemDetailCache[entry.item.id];
                    const childRequirement = getCraftingRequirement(childDetail);
                    if (!childRequirement?.requiredItems?.length) return null;
                    return renderUpgradeChain(entry.item.id, entry.amount * crafts, depth + 1, new Set(visited));
                })}
            </div>
        );
    };

    useEffect(() => {
        if (!crafting?.requiredItems?.length) return;

        let isMounted = true;
        const preloadUpgradeDetails = async (initialIds: string[]) => {
            const fetched: Record<string, ArcItemDetail> = {};
            const queue = [ ...initialIds ];
            const visited = new Set<string>();

            while (queue.length > 0) {
                const id = queue.shift();
                if (!id || visited.has(id)) continue;
                visited.add(id);

                if (itemDetailCache[id] || fetched[id]) continue;

                try {
                    const response = await fetch(`/api/arcdb/items/${id}`);
                    if (!response.ok) continue;
                    const data: ArcItemDetail = await response.json();
                    fetched[id] = data;

                    const requirement = getCraftingRequirement(data);
                    const childIds = requirement?.requiredItems
                        .map((entry) => entry.item.id) || [];

                    queue.push(...childIds);
                } catch (err) {
                    continue;
                }
            }

            if (isMounted && Object.keys(fetched).length > 0) {
                setItemDetailCache((prev) => ({ ...prev, ...fetched }));
            }
        };

        const requiredIds = crafting.requiredItems.map((entry) => entry.item.id);
        if (requiredIds.length > 0) preloadUpgradeDetails(requiredIds);
        return () => { isMounted = false; };
    }, [crafting, itemDetailCache]);

    const handleQuantityChange = (value: string) => {
        const parsed = parseInt(value, 10);
        if (Number.isNaN(parsed) || parsed < 1) {
            setQuantity(1);
        } else {
            setQuantity(parsed);
        }
    };

    const handleRequirementClick = (itemId: string) => {
        setSelectedItemId(itemId);
        setBreadcrumbIds((prev) => {
            const existingIndex = prev.indexOf(itemId);
            if (existingIndex >= 0) return prev.slice(0, existingIndex + 1);
            if (!selectedItemId) return [itemId];
            return [ ...prev, itemId ];
        });
        if (quantity !== 1) setQuantity(1);
    };

    const handleBreadcrumbClick = (itemId: string, index: number) => {
        setSelectedItemId(itemId);
        setBreadcrumbIds((prev) => prev.slice(0, index + 1));
    };

    const getItemLabel = (itemId: string) => {
        const match = items.find((item) => item.id === itemId);
        return match?.name || itemId;
    };

    const renderCraftingRequirements = (requirement?: ArcCraftingRequirement) => {
        if (!requirement) {
            return (
                <div className='arc-workbench__empty'>This item does not have crafting data.</div>
            );
        }

        const expandedUpgrades = requirement.requiredItems.filter((entry) => {
            if (!isUpgradeName(entry.item.name)) return false;
            const detail = itemDetailCache[entry.item.id];
            const detailRequirement = getCraftingRequirement(detail);
            return Boolean(detailRequirement?.requiredItems?.length);
        });

        const baseRequirements = requirement.requiredItems.filter((entry) => {
            if (!isUpgradeName(entry.item.name)) return true;
            const detail = itemDetailCache[entry.item.id];
            const detailRequirement = getCraftingRequirement(detail);
            return !detailRequirement?.requiredItems?.length;
        });

        return (
            <div className='arc-workbench__requirements'>
                <div className='arc-workbench__requirements-header'>
                    <h4>Crafting Requirements</h4>
                    <span className='arc-workbench__requirements-meta'>
                        Output: {requirement.outputAmount} • Crafts Needed: {craftsNeeded}
                    </span>
                </div>
                {requirement.station && (
                    <div className='arc-workbench__station'>
                        <span>Station</span>
                        <strong>
                            {requirement.station.name || requirement.station.id || 'Unknown'}
                        </strong>
                        {requirement.station.tier !== undefined && (
                            <span className='arc-workbench__station-tier'>Tier {requirement.station.tier}</span>
                        )}
                    </div>
                )}
                <div className='arc-workbench__requirements-grid'>
                    {expandedUpgrades.map((entry) => {
                        const detail = itemDetailCache[entry.item.id];
                        const upgradeRequirement = getCraftingRequirement(detail);
                        if (!upgradeRequirement) return null;
                        const requiredUnits = entry.amount * craftsNeeded;
                        const upgradeCraftsNeeded = getCraftsNeeded(requiredUnits, upgradeRequirement.outputAmount || 1);
                        const aggregate = buildAggregateMaterials(entry.item.id, requiredUnits, new Set());
                        const aggregateList = Object.values(aggregate);

                        return (
                            <div key={`upgrade-${entry.item.id}`} className='arc-workbench__requirement-group'>
                                <div className='arc-workbench__requirement-group-header'>
                                    <div className='arc-workbench__requirement-group-title'>
                                        Upgrade materials for {entry.item.name}
                                    </div>
                                    <span className='arc-workbench__requirement-group-chip'>Upgrade chain</span>
                                </div>
                                <div className='arc-workbench__requirement-group-meta'>
                                    Need {requiredUnits} (craft {upgradeCraftsNeeded}x)
                                </div>
                                {renderUpgradeChain(entry.item.id, requiredUnits)}
                                {aggregateList.length > 0 && (
                                    <div className='arc-workbench__aggregate'>
                                        <div className='arc-workbench__aggregate-header'>Total materials required</div>
                                        <div className='arc-workbench__aggregate-grid'>
                                            {aggregateList.map((material) => (
                                                <button
                                                    key={`aggregate-${entry.item.id}-${material.item.id}`}
                                                    className='arc-workbench__aggregate-card'
                                                    onClick={() => handleRequirementClick(material.item.id)}
                                                    type='button'
                                                >
                                                    <div className='arc-workbench__requirement-title'>
                                                        <div className='arc-workbench__requirement-image'>
                                                            <img
                                                                src={resolveIconUrl(material.item.icon)}
                                                                alt={material.item.name}
                                                            />
                                                        </div>
                                                        <div className='arc-workbench__requirement-name'>
                                                            {material.item.name}
                                                        </div>
                                                    </div>
                                                    <div className='arc-workbench__requirement-meta'>
                                                        Needed: {material.amount}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {baseRequirements.map((entry) => {
                        const totalAmount = entry.amount * craftsNeeded;
                        return (
                            <button
                                key={`${entry.item.id}-${entry.amount}`}
                                className='arc-workbench__requirement-card'
                                onClick={() => handleRequirementClick(entry.item.id)}
                                type='button'
                            >
                                <div className='arc-workbench__requirement-info'>
                                    <div className='arc-workbench__requirement-title'>
                                        <div className='arc-workbench__requirement-image'>
                                            <img
                                                src={resolveIconUrl(entry.item.icon)}
                                                alt={entry.item.name}
                                            />
                                        </div>
                                        <div className='arc-workbench__requirement-name'>
                                            {entry.item.name}
                                        </div>
                                    </div>
                                    <div className='arc-workbench__requirement-meta'>
                                        Base: {entry.amount} • Needed: {totalAmount}
                                    </div>
                                </div>
                                <div className='arc-workbench__requirement-type'>
                                    {entry.item.item_type || 'Unknown type'}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const rarityKey = selectedItem?.rarity ? selectedItem.rarity.toString().toLowerCase() : 'unknown';
    const foundInLocations = selectedItem?.locations?.length
        ? selectedItem.locations
        : selectedItem?.loot_area
            ? [ selectedItem.loot_area ]
            : [];
    const stackSize = selectedItem?.stat_block?.stackSize;
    const weight = selectedItem?.stat_block?.weight;

    return (
        <Container className='arc-workbench' maxWidth={false} disableGutters>
            <Container className='arc-workbench__content' maxWidth='lg'>
                <div className='arc-workbench__hero'>
                    <h2>ARC Raiders Workbench</h2>
                    <p>Search the ArcDB, inspect items, and calculate exact crafting requirements.</p>
                </div>

                <div className='arc-workbench__controls'>
                    <div className='arc-workbench__breadcrumbs'>
                        <Breadcrumbs aria-label='breadcrumb'>
                            {breadcrumbIds.length === 0 && (
                                <span className='arc-workbench__breadcrumb-muted'>No item history yet</span>
                            )}
                            {breadcrumbIds.map((crumbId, index) => {
                                const isLast = index === breadcrumbIds.length - 1;
                                return (
                                    <Button
                                        key={crumbId}
                                        className={`arc-workbench__breadcrumb${isLast ? ' arc-workbench__breadcrumb--active' : ''}`}
                                        onClick={() => handleBreadcrumbClick(crumbId, index)}
                                        disabled={isLast}
                                    >
                                        {getItemLabel(crumbId)}
                                    </Button>
                                );
                            })}
                        </Breadcrumbs>
                    </div>
                    <div className='arc-workbench__control'>
                        <label htmlFor='arc-item-search'>Item</label>
                        <Autocomplete
                            id='arc-item-search'
                            options={items}
                            loading={itemsLoading}
                            value={selectedItemSummary}
                            onChange={(_, value) => {
                                setSelectedItemId(value?.id || null);
                                setBreadcrumbIds(value?.id ? [ value.id ] : []);
                            }}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder='Search ArcDB items'
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {itemsLoading ? <CircularProgress color='inherit' size={18} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        )
                                    }}
                                />
                            )}
                        />
                        {itemsError && <span className='arc-workbench__error'>{itemsError}</span>}
                    </div>

                    <div className='arc-workbench__control arc-workbench__control--quantity'>
                        <label htmlFor='arc-quantity'>Quantity</label>
                        <TextField
                            id='arc-quantity'
                            type='number'
                            inputProps={{ min: 1 }}
                            value={quantity}
                            onChange={(event) => handleQuantityChange(event.target.value)}
                        />
                    </div>
                </div>

                <div className='arc-workbench__body'>
                    <section className='arc-workbench__details'>
                        <div className='arc-workbench__details-header'>
                            <h3>Item Details</h3>
                        </div>
                        {itemLoading && (
                            <div className='arc-workbench__loading'>
                                <CircularProgress size={28} />
                                <span>Loading item data...</span>
                            </div>
                        )}
                        {itemError && <span className='arc-workbench__error'>{itemError}</span>}
                        {!itemLoading && !selectedItem && (
                            <div className='arc-workbench__empty'>Select an item to view details.</div>
                        )}
                        {selectedItem && (
                            <div className='arc-workbench__details-content'>
                                <div className='arc-workbench__title-row'>
                                    <div>
                                        <h3>{selectedItem.name}</h3>
                                        <span className='arc-workbench__subtitle'>{selectedItem.item_type || 'Unknown type'}</span>
                                    </div>
                                    {selectedItem.icon && (
                                        <img
                                            src={resolveIconUrl(selectedItem.icon)}
                                            alt={selectedItem.name}
                                            className='arc-workbench__image'
                                        />
                                    )}
                                </div>
                                {selectedItem.description && (
                                    <p className='arc-workbench__description'>{selectedItem.description}</p>
                                )}
                                <div className='arc-workbench__chips'>
                                    <Chip
                                        label={selectedItem.rarity ? `${selectedItem.rarity} rarity` : 'Unknown rarity'}
                                        className={`arc-workbench__chip arc-workbench__chip--${rarityKey}`}
                                    />
                                    <Chip
                                        label={`Stack: ${stackSize ?? '—'}`}
                                        className='arc-workbench__chip'
                                    />
                                    <Chip
                                        label={`Weight: ${weight ?? '—'}`}
                                        className='arc-workbench__chip'
                                    />
                                    <Chip
                                        label={`Value: ${selectedItem.value ?? '—'}`}
                                        className='arc-workbench__chip'
                                    />
                                </div>
                                <div className='arc-workbench__foundin'>
                                    <strong>Found In</strong>
                                    <div className='arc-workbench__foundin-tags'>
                                        {(foundInLocations.length > 0) ? (
                                            foundInLocations.map((location) => (
                                                <span key={location} className='arc-workbench__foundin-tag'>{location}</span>
                                            ))
                                        ) : (
                                            <span className='arc-workbench__empty'>No locations listed.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className='arc-workbench__crafting'>
                        {renderCraftingRequirements(crafting)}
                    </section>
                </div>
            </Container>
        </Container>
    );
};

export default ArcWorkbench;
