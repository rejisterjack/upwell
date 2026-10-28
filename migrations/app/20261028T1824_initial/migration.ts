#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/401d90080b3627052966917278ebb860144d208decf4e0e7278f7cf4d9c0dfd3/contract';
import endContract from '../../snapshots/401d90080b3627052966917278ebb860144d208decf4e0e7278f7cf4d9c0dfd3/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'AlertDelivery',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('destinationId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('error', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('event', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('ok', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
          col('serviceName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'AlertDestination',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('enabled', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('kind', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('target', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'AlertDestination_kind_check_c88e5e3e',
            sql`"kind" IN ('email', 'webhook')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Check',
        columns: [
          col('checkedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('error', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('outcome', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('responseMs', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('serviceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('statusCode', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Check_outcome_check_02ac593f',
            sql`"outcome" IN ('up', 'degraded', 'down')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'DailyStat',
        columns: [
          col('avgResponseMs', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('day', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
          col('degradedChecks', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('downChecks', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('serviceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('totalChecks', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('upChecks', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Incident',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('impact', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('resolvedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
          col('startedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Incident_impact_check_ea9f77fa',
            sql`"impact" IN ('minor', 'major', 'critical', 'maintenance')`,
          ),
          checkExpression(
            'Incident_status_check_06a46d23',
            sql`"status" IN ('investigating', 'identified', 'monitoring', 'resolved')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'IncidentService',
        columns: [
          col('incidentId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('serviceId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['incidentId', 'serviceId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'IncidentUpdate',
        columns: [
          col('body', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('incidentId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'IncidentUpdate_status_check_06a46d23',
            sql`"status" IN ('investigating', 'identified', 'monitoring', 'resolved')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'LoginAttempt',
        columns: [
          col('attemptedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('ip', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Service',
        columns: [
          col('consecutiveFailures', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('degradedAfterMs', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('enabled', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('expectedStatus', 'int4', {
            notNull: true,
            default: lit(200),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('groupLabel', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('lastCheckedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
          col('lastResponseMs', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('method', 'text', {
            notNull: true,
            default: lit('GET'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('position', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('unknown'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('timeoutMs', 'int4', {
            notNull: true,
            default: lit(8000),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('url', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('Service_method_check_a2e56478', sql`"method" IN ('GET', 'HEAD')`),
          checkExpression(
            'Service_status_check_26e92039',
            sql`"status" IN ('unknown', 'operational', 'degraded', 'down', 'maintenance')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Setting',
        columns: [
          col('checkIntervalSeconds', 'int4', {
            notNull: true,
            default: lit(86400),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('failuresBeforeAlert', 'int4', {
            notNull: true,
            default: lit(2),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('siteName', 'text', {
            notNull: true,
            default: lit('Status'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('siteUrl', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'DailyStat',
        constraint: 'DailyStat_serviceId_day_key',
        columns: ['serviceId', 'day'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AlertDelivery',
        index: 'AlertDelivery_destinationId_idx_1646ee5c',
        columns: ['destinationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Check',
        index: 'Check_serviceId_checkedAt_idx_028345cd',
        columns: ['serviceId', 'checkedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Check',
        index: 'Check_serviceId_idx_b5d9acbf',
        columns: ['serviceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'DailyStat',
        index: 'DailyStat_serviceId_idx_b5d9acbf',
        columns: ['serviceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'IncidentService',
        index: 'IncidentService_incidentId_idx_20b6f3c9',
        columns: ['incidentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'IncidentService',
        index: 'IncidentService_serviceId_idx_b5d9acbf',
        columns: ['serviceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'IncidentUpdate',
        index: 'IncidentUpdate_incidentId_idx_20b6f3c9',
        columns: ['incidentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LoginAttempt',
        index: 'LoginAttempt_ip_attemptedAt_idx_80ca34db',
        columns: ['ip', 'attemptedAt'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'AlertDelivery',
        foreignKey: {
          name: 'AlertDelivery_destinationId_fkey',
          columns: ['destinationId'],
          references: { schema: 'public', table: 'AlertDestination', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Check',
        foreignKey: {
          name: 'Check_serviceId_fkey',
          columns: ['serviceId'],
          references: { schema: 'public', table: 'Service', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'DailyStat',
        foreignKey: {
          name: 'DailyStat_serviceId_fkey',
          columns: ['serviceId'],
          references: { schema: 'public', table: 'Service', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'IncidentService',
        foreignKey: {
          name: 'IncidentService_incidentId_fkey',
          columns: ['incidentId'],
          references: { schema: 'public', table: 'Incident', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'IncidentService',
        foreignKey: {
          name: 'IncidentService_serviceId_fkey',
          columns: ['serviceId'],
          references: { schema: 'public', table: 'Service', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'IncidentUpdate',
        foreignKey: {
          name: 'IncidentUpdate_incidentId_fkey',
          columns: ['incidentId'],
          references: { schema: 'public', table: 'Incident', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
