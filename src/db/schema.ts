import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

const identity = {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
};

export const tenants = pgTable("tenants", {
  ...identity,
  name: text("name").notNull(),
  slug: text("slug").notNull().unique()
});
export const sites = pgTable(
  "sites",
  {
    ...identity,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: text("name").notNull(),
    code: text("code").notNull(),
    timezone: text("timezone").notNull().default("UTC")
  },
  (table) => [uniqueIndex("sites_tenant_code_uidx").on(table.tenantId, table.code)]
);
export const productionAreas = pgTable(
  "production_areas",
  {
    ...identity,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id),
    name: text("name").notNull(),
    code: text("code").notNull()
  },
  (table) => [index("production_areas_site_idx").on(table.siteId)]
);
export const assetTypes = pgTable("asset_types", {
  ...identity,
  name: text("name").notNull(),
  manufacturer: text("manufacturer"),
  model: text("model")
});
export const assets = pgTable(
  "assets",
  {
    ...identity,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id),
    productionAreaId: uuid("production_area_id")
      .notNull()
      .references(() => productionAreas.id),
    assetTypeId: uuid("asset_type_id")
      .notNull()
      .references(() => assetTypes.id),
    tag: text("tag").notNull(),
    name: text("name").notNull(),
    serialNumber: text("serial_number"),
    metadata: jsonb("metadata").notNull().default({})
  },
  (table) => [
    uniqueIndex("assets_tenant_tag_uidx").on(table.tenantId, table.tag),
    index("assets_site_area_idx").on(table.siteId, table.productionAreaId)
  ]
);
export const sensors = pgTable(
  "sensors",
  {
    ...identity,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id),
    tag: text("tag").notNull(),
    measurement: text("measurement").notNull(),
    unit: text("unit").notNull(),
    simulated: boolean("simulated").notNull().default(true)
  },
  (table) => [uniqueIndex("sensors_asset_tag_uidx").on(table.assetId, table.tag)]
);
export const sensorReadings = pgTable(
  "sensor_readings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id),
    sensorId: uuid("sensor_id")
      .notNull()
      .references(() => sensors.id),
    scenarioId: uuid("scenario_id"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    value: doublePrecision("value").notNull(),
    quality: text("quality").notNull().default("good"),
    simulated: boolean("simulated").notNull().default(true)
  },
  (table) => [
    uniqueIndex("sensor_readings_sensor_time_uidx").on(table.sensorId, table.recordedAt),
    index("sensor_readings_scenario_time_idx").on(table.scenarioId, table.recordedAt)
  ]
);
export const operationalMetrics = pgTable(
  "operational_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id),
    productionAreaId: uuid("production_area_id")
      .notNull()
      .references(() => productionAreas.id),
    scenarioId: uuid("scenario_id"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    name: text("name").notNull(),
    value: doublePrecision("value").notNull(),
    unit: text("unit").notNull(),
    context: jsonb("context").notNull().default({}),
    simulated: boolean("simulated").notNull().default(true)
  },
  (table) => [
    index("operational_metrics_area_time_idx").on(table.productionAreaId, table.recordedAt)
  ]
);
export const scenarios = pgTable(
  "scenarios",
  {
    ...identity,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    fixtureVersion: text("fixture_version").notNull(),
    simulated: boolean("simulated").notNull().default(true)
  },
  (table) => [uniqueIndex("scenarios_tenant_slug_uidx").on(table.tenantId, table.slug)]
);
export const scenarioStages = pgTable(
  "scenario_stages",
  {
    ...identity,
    scenarioId: uuid("scenario_id")
      .notNull()
      .references(() => scenarios.id),
    key: text("key").notNull(),
    label: text("label").notNull(),
    ordinal: integer("ordinal").notNull(),
    startMinute: integer("start_minute").notNull(),
    description: text("description").notNull()
  },
  (table) => [
    uniqueIndex("scenario_stages_scenario_key_uidx").on(table.scenarioId, table.key),
    uniqueIndex("scenario_stages_scenario_ordinal_uidx").on(table.scenarioId, table.ordinal)
  ]
);
export const scenarioStates = pgTable("scenario_states", {
  ...identity,
  scenarioId: uuid("scenario_id")
    .notNull()
    .references(() => scenarios.id)
    .unique(),
  status: text("status").notNull().default("idle"),
  elapsedMinutes: doublePrecision("elapsed_minutes").notNull().default(0),
  speed: integer("speed").notNull().default(12),
  currentStageKey: text("current_stage_key").notNull().default("normal"),
  lastActor: text("last_actor").notNull().default("system")
});
export const roles = pgTable(
  "roles",
  {
    ...identity,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    key: text("key").notNull(),
    name: text("name").notNull(),
    permissions: jsonb("permissions").notNull().default([])
  },
  (table) => [uniqueIndex("roles_tenant_key_uidx").on(table.tenantId, table.key)]
);
export const users = pgTable(
  "users",
  {
    ...identity,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    active: boolean("active").notNull().default(true)
  },
  (table) => [uniqueIndex("users_tenant_email_uidx").on(table.tenantId, table.email)]
);
export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    siteId: uuid("site_id").references(() => sites.id),
    scenarioId: uuid("scenario_id").references(() => scenarios.id),
    actorType: text("actor_type").notNull(),
    actorId: text("actor_id").notNull(),
    eventType: text("event_type").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    detail: jsonb("detail").notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("audit_events_scenario_time_idx").on(table.scenarioId, table.occurredAt),
    index("audit_events_tenant_entity_idx").on(table.tenantId, table.entityType, table.entityId)
  ]
);
export const sourceRecords = pgTable(
  "source_records",
  {
    ...identity,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id),
    recordType: text("record_type").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    title: text("title").notNull(),
    detail: text("detail").notNull(),
    simulated: boolean("simulated").notNull().default(true)
  },
  (table) => [index("source_records_asset_time_idx").on(table.assetId, table.occurredAt)]
);
