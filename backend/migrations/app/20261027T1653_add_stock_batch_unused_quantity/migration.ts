#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/03097e4092520b0341176b3ca0e7c1fd2f0682d7dffb12d6286fc6c0b4794193/contract';
import endContract from '../../snapshots/03097e4092520b0341176b3ca0e7c1fd2f0682d7dffb12d6286fc6c0b4794193/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/44d6762a650c035679787d64ff2c20dac1d007d55e16b6814a12c122dafcdf11/contract';
import startContract from '../../snapshots/44d6762a650c035679787d64ff2c20dac1d007d55e16b6814a12c122dafcdf11/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';
import postgres from '@prisma/orm-postgres/runtime';

// Typed SQL builder over the END contract (connects lazily, no connection opened here).
const { sql: db, contract } = postgres<End>({ contractJson: endContract });

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'StockBatch',
        column: col('unusedQuantity', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      // Existing batches: no bottle has been opened from them yet (no DecantBottle rows),
      // so every bottle received is still unused → unusedQuantity = quantity.
      this.dataTransform(contract, 'backfill-StockBatch-unusedQuantity', {
        // "Work remains" while any batch still has no unusedQuantity.
        check: () =>
          db.public.StockBatch.select('id')
            .where((f, fns) => fns.eq(f.unusedQuantity, null))
            .limit(1),
        run: () =>
          db.public.StockBatch.update((f) => ({ unusedQuantity: f.quantity }))
            .where((f, fns) => fns.eq(f.unusedQuantity, null)),
      }),
      this.setNotNull({ schema: 'public', table: 'StockBatch', column: 'unusedQuantity' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
