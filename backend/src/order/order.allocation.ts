// Pure stock-allocation helpers (no database access), shared by OrderService and its tests.

export type SellingType = 'COMPLETE' | 'DECANT_10ML' | 'DECANT_20ML';

export const SELLING_TYPES: readonly SellingType[] = ['COMPLETE', 'DECANT_10ML', 'DECANT_20ML'];

// Size of one retail decant, in millilitres.
export const DECANT_SIZE_ML: Record<Exclude<SellingType, 'COMPLETE'>, number> = {
    DECANT_10ML: 10,
    DECANT_20ML: 20,
};

export type PriceList = {
    completePrice: number;
    decant10Price: number;
    decant20Price: number;
};

// The unit price always comes from the perfume's current prices, never from the client.
export function unitPriceFor ( sellingType: SellingType, parfum: PriceList ) {
    if (sellingType === 'COMPLETE') return parfum.completePrice;
    if (sellingType === 'DECANT_10ML') return parfum.decant10Price;
    return parfum.decant20Price;
}

// What one order line needs from stock: sealed bottles for COMPLETE, millilitres for decants.
export function requiredAmount ( sellingType: SellingType, quantity: number ) {
    if (sellingType === 'COMPLETE') return quantity;
    return quantity * DECANT_SIZE_ML[sellingType];
}

export type StockSource = {
    id: number;
    // unusedQuantity - reservedQuantity (batches) or remainingVolumeMl - reservedVolumeMl (bottles)
    available: number;
};

export type Allocation = {
    id: number;
    amount: number;
};

// Takes `required` from the sources in the order given (callers pass them oldest first: FIFO),
// spreading over several sources when one is not enough.
// Returns null when the sources together can't cover the requirement: nothing is partially allocated.
export function allocate ( required: number, sources: readonly StockSource[] ): Allocation[] | null {
    if (!Number.isInteger(required) || required <= 0) return null;

    const allocations: Allocation[] = [];
    let left = required;

    for (const source of sources) {
        if (left === 0) break;
        if (source.available <= 0) continue;

        const amount = Math.min(source.available, left);
        allocations.push({ id: source.id, amount });
        left -= amount;
    }

    return left === 0 ? allocations : null;
}

// Total still available over a list of sources (never negative).
export function totalAvailable ( sources: readonly StockSource[] ) {
    return sources.reduce((sum, source) => sum + Math.max(source.available, 0), 0);
}
