#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/44d6762a650c035679787d64ff2c20dac1d007d55e16b6814a12c122dafcdf11/contract';
import endContract from '../../snapshots/44d6762a650c035679787d64ff2c20dac1d007d55e16b6814a12c122dafcdf11/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Brand',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('image', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Customer',
        columns: [
          col('address', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('phoneNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'DecantBottle',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('initialVolumeMl', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('lastDecantedAt', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('parfumId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('remainingVolumeMl', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('reservedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('reservedById', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('stockBatchId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'DecantOpperation',
        columns: [
          col('decantBottleId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('employeeId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('oppType', 'text', {
            notNull: true,
            default: lit('CONSUMPTION'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('orderId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('performedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('quantityMl', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('reversedOperationId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'DecantOpperation_oppType_check_65d6655e',
            "\"oppType\" IN ('CONSUMPTION', 'REVERSAL')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'DeliveryCompany',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('delivreyPrice', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('lastUsedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Order',
        columns: [
          col('cancelledAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('cancelledBy', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('createdBy', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('customerId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('deliveryAdress', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('deliveryCompanyId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('deliveryPrice', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('delivredAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('pendingAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('verifiedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('verifiedBy', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Order_status_check_ba3c86fa',
            "\"status\" IN ('COMFIRMED', 'PENDING', 'CANCELLED', 'DELIVERD')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'OrderItem',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('orderId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('parfumId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('sellingType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('totalPrice', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('unitPrice', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'OrderItem_sellingType_check_5cd55605',
            "\"sellingType\" IN ('COMPLETE', 'DECANT_10ML', 'DECANT_20ML')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'OrderitemConsumption',
        columns: [
          col('consumedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('decantBottleId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('orderItemId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('quantityMl', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Parfum',
        columns: [
          col('brandId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('completePrice', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('decant10Price', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('decant20Price', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('originalVolume', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'StockBatch',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('parfumId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('purchaseCostPerBottle', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('receivedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('receivedBy', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('Role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('firstName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('lastLoginAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('lastName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastUpdate', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phoneNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('username', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('User_Role_check_3735df3b', "\"Role\" IN ('OWNER', 'EMPLOYEE')"),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Brand',
        constraint: 'Brand_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'DecantOpperation',
        constraint: 'DecantOpperation_reversedOperationId_key',
        columns: ['reversedOperationId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Parfum',
        constraint: 'Parfum_brandId_name_originalVolume_key',
        columns: ['brandId', 'name', 'originalVolume'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_username_key',
        columns: ['username'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'DecantBottle',
        index: 'DecantBottle_parfumId_idx_e62e82ad',
        columns: ['parfumId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'DecantBottle',
        index: 'DecantBottle_reservedById_idx_18189388',
        columns: ['reservedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'DecantBottle',
        index: 'DecantBottle_stockBatchId_idx_a1b7aade',
        columns: ['stockBatchId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'DecantOpperation',
        index: 'DecantOpperation_decantBottleId_idx_a6360438',
        columns: ['decantBottleId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'DecantOpperation',
        index: 'DecantOpperation_employeeId_idx_087dd4a6',
        columns: ['employeeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'DecantOpperation',
        index: 'DecantOpperation_orderId_idx_d284871b',
        columns: ['orderId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Order',
        index: 'Order_cancelledBy_idx_c27f79a3',
        columns: ['cancelledBy'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Order',
        index: 'Order_createdBy_idx_ba0f792f',
        columns: ['createdBy'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Order',
        index: 'Order_customerId_idx_b2a8a46c',
        columns: ['customerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Order',
        index: 'Order_deliveryCompanyId_idx_f23a4b4c',
        columns: ['deliveryCompanyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Order',
        index: 'Order_verifiedBy_idx_950670c2',
        columns: ['verifiedBy'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'OrderItem',
        index: 'OrderItem_orderId_idx_d284871b',
        columns: ['orderId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'OrderItem',
        index: 'OrderItem_parfumId_idx_e62e82ad',
        columns: ['parfumId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'OrderitemConsumption',
        index: 'OrderitemConsumption_decantBottleId_idx_a6360438',
        columns: ['decantBottleId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'OrderitemConsumption',
        index: 'OrderitemConsumption_orderItemId_idx_99e2d9f7',
        columns: ['orderItemId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Parfum',
        index: 'Parfum_brandId_idx_02e95397',
        columns: ['brandId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StockBatch',
        index: 'StockBatch_parfumId_idx_e62e82ad',
        columns: ['parfumId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StockBatch',
        index: 'StockBatch_receivedBy_idx_c1d3f365',
        columns: ['receivedBy'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'DecantBottle',
        foreignKey: {
          name: 'DecantBottle_parfumId_fkey',
          columns: ['parfumId'],
          references: { schema: 'public', table: 'Parfum', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'DecantBottle',
        foreignKey: {
          name: 'DecantBottle_stockBatchId_fkey',
          columns: ['stockBatchId'],
          references: { schema: 'public', table: 'StockBatch', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'DecantBottle',
        foreignKey: {
          name: 'DecantBottle_reservedById_fkey',
          columns: ['reservedById'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'DecantOpperation',
        foreignKey: {
          name: 'DecantOpperation_decantBottleId_fkey',
          columns: ['decantBottleId'],
          references: { schema: 'public', table: 'DecantBottle', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'DecantOpperation',
        foreignKey: {
          name: 'DecantOpperation_employeeId_fkey',
          columns: ['employeeId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'DecantOpperation',
        foreignKey: {
          name: 'DecantOpperation_orderId_fkey',
          columns: ['orderId'],
          references: { schema: 'public', table: 'Order', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'DecantOpperation',
        foreignKey: {
          name: 'DecantOpperation_reversedOperationId_fkey',
          columns: ['reversedOperationId'],
          references: { schema: 'public', table: 'DecantOpperation', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Order',
        foreignKey: {
          name: 'Order_createdBy_fkey',
          columns: ['createdBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Order',
        foreignKey: {
          name: 'Order_verifiedBy_fkey',
          columns: ['verifiedBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Order',
        foreignKey: {
          name: 'Order_cancelledBy_fkey',
          columns: ['cancelledBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Order',
        foreignKey: {
          name: 'Order_customerId_fkey',
          columns: ['customerId'],
          references: { schema: 'public', table: 'Customer', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Order',
        foreignKey: {
          name: 'Order_deliveryCompanyId_fkey',
          columns: ['deliveryCompanyId'],
          references: { schema: 'public', table: 'DeliveryCompany', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'OrderItem',
        foreignKey: {
          name: 'OrderItem_orderId_fkey',
          columns: ['orderId'],
          references: { schema: 'public', table: 'Order', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'OrderItem',
        foreignKey: {
          name: 'OrderItem_parfumId_fkey',
          columns: ['parfumId'],
          references: { schema: 'public', table: 'Parfum', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'OrderitemConsumption',
        foreignKey: {
          name: 'OrderitemConsumption_orderItemId_fkey',
          columns: ['orderItemId'],
          references: { schema: 'public', table: 'OrderItem', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'OrderitemConsumption',
        foreignKey: {
          name: 'OrderitemConsumption_decantBottleId_fkey',
          columns: ['decantBottleId'],
          references: { schema: 'public', table: 'DecantBottle', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Parfum',
        foreignKey: {
          name: 'Parfum_brandId_fkey',
          columns: ['brandId'],
          references: { schema: 'public', table: 'Brand', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'StockBatch',
        foreignKey: {
          name: 'StockBatch_parfumId_fkey',
          columns: ['parfumId'],
          references: { schema: 'public', table: 'Parfum', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'StockBatch',
        foreignKey: {
          name: 'StockBatch_receivedBy_fkey',
          columns: ['receivedBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
