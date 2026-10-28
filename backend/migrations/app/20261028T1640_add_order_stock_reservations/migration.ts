#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/03097e4092520b0341176b3ca0e7c1fd2f0682d7dffb12d6286fc6c0b4794193/contract';
import startContract from '../../snapshots/03097e4092520b0341176b3ca0e7c1fd2f0682d7dffb12d6286fc6c0b4794193/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c20cd972509d72c645850bd1d17ef16a59874ce38010529deb8cbf18ce858d88/contract';
import endContract from '../../snapshots/c20cd972509d72c645850bd1d17ef16a59874ce38010529deb8cbf18ce858d88/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'StockReservation',
        columns: [
          col('consumedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('decantBottleId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('orderItemId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('quantity', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('quantityMl', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('releasedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('RESERVED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('stockBatchId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'StockReservation_status_check_4f928414',
            "\"status\" IN ('RESERVED', 'CONSUMED', 'RELEASED')",
          ),
          checkExpression(
            'stockreservation_one_source_5172c28e',
            '("stockBatchId" IS NOT NULL AND "quantity" IS NOT NULL AND "quantity" > 0 AND "decantBottleId" IS NULL AND "quantityMl" IS NULL) OR ("decantBottleId" IS NOT NULL AND "quantityMl" IS NOT NULL AND "quantityMl" > 0 AND "stockBatchId" IS NULL AND "quantity" IS NULL)',
          ),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'DecantBottle',
        column: col('reservedVolumeMl', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'StockBatch',
        column: col('reservedQuantity', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'DecantBottle',
        constraint: 'decantbottle_volume_bounds_eb759b42',
        expression:
          '"remainingVolumeMl" >= 0 AND "reservedVolumeMl" >= 0 AND "reservedVolumeMl" <= "remainingVolumeMl" AND "remainingVolumeMl" <= "initialVolumeMl"',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'OrderItem',
        constraint: 'orderitem_positive_amounts_a2f05bc9',
        expression: '"quantity" > 0 AND "unitPrice" >= 0 AND "totalPrice" >= 0',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'StockBatch',
        constraint: 'stockbatch_reservation_bounds_23ceabb8',
        expression:
          '"unusedQuantity" >= 0 AND "reservedQuantity" >= 0 AND "reservedQuantity" <= "unusedQuantity"',
      }),
      this.createIndex({
        schema: 'public',
        table: 'StockReservation',
        index: 'StockReservation_decantBottleId_idx_a6360438',
        columns: ['decantBottleId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StockReservation',
        index: 'StockReservation_orderItemId_idx_99e2d9f7',
        columns: ['orderItemId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StockReservation',
        index: 'StockReservation_stockBatchId_idx_a1b7aade',
        columns: ['stockBatchId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'StockReservation',
        foreignKey: {
          name: 'StockReservation_orderItemId_fkey',
          columns: ['orderItemId'],
          references: { schema: 'public', table: 'OrderItem', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'StockReservation',
        foreignKey: {
          name: 'StockReservation_stockBatchId_fkey',
          columns: ['stockBatchId'],
          references: { schema: 'public', table: 'StockBatch', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'StockReservation',
        foreignKey: {
          name: 'StockReservation_decantBottleId_fkey',
          columns: ['decantBottleId'],
          references: { schema: 'public', table: 'DecantBottle', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
