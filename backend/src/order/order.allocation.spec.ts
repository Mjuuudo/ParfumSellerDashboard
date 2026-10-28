import { allocate, requiredAmount, totalAvailable, unitPriceFor } from './order.allocation.js';

describe('order allocation', () => {
  it('takes everything from the first source when it is enough', () => {
    expect(allocate(2, [{ id: 1, available: 5 }, { id: 2, available: 5 }])).toEqual([{ id: 1, amount: 2 }]);
  });

  it('spreads one requirement over several sources, oldest first', () => {
    expect(allocate(40, [{ id: 7, available: 25 }, { id: 9, available: 100 }])).toEqual([
      { id: 7, amount: 25 },
      { id: 9, amount: 15 },
    ]);
  });

  it('skips empty or over-reserved sources', () => {
    expect(allocate(10, [{ id: 1, available: 0 }, { id: 2, available: -3 }, { id: 3, available: 10 }])).toEqual([
      { id: 3, amount: 10 },
    ]);
  });

  it('returns null (no partial allocation) when stock is insufficient', () => {
    expect(allocate(31, [{ id: 1, available: 10 }, { id: 2, available: 20 }])).toBeNull();
    expect(allocate(1, [])).toBeNull();
  });

  it('rejects invalid requirements', () => {
    expect(allocate(0, [{ id: 1, available: 10 }])).toBeNull();
    expect(allocate(-5, [{ id: 1, available: 10 }])).toBeNull();
    expect(allocate(1.5, [{ id: 1, available: 10 }])).toBeNull();
  });

  it('converts a line into bottles or millilitres', () => {
    expect(requiredAmount('COMPLETE', 3)).toBe(3);
    expect(requiredAmount('DECANT_10ML', 3)).toBe(30);
    expect(requiredAmount('DECANT_20ML', 2)).toBe(40);
  });

  it('prices a line from the perfume, never from the client', () => {
    const parfum = { completePrice: 1700, decant10Price: 220, decant20Price: 400 };
    expect(unitPriceFor('COMPLETE', parfum)).toBe(1700);
    expect(unitPriceFor('DECANT_10ML', parfum)).toBe(220);
    expect(unitPriceFor('DECANT_20ML', parfum)).toBe(400);
  });

  it('sums availability without counting negative sources', () => {
    expect(totalAvailable([{ id: 1, available: 5 }, { id: 2, available: -2 }, { id: 3, available: 4 }])).toBe(9);
  });
});
