#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/24e5ce40b66b0d7fccca3e15d975594ed58291d582b294101a468125c0b73306/contract';
import endContract from '../../snapshots/24e5ce40b66b0d7fccca3e15d975594ed58291d582b294101a468125c0b73306/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/401d90080b3627052966917278ebb860144d208decf4e0e7278f7cf4d9c0dfd3/contract';
import startContract from '../../snapshots/401d90080b3627052966917278ebb860144d208decf4e0e7278f7cf4d9c0dfd3/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'CheckLock',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lockedUntil', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('owner', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
