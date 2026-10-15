import * as migration_20261014_091355_initial from './20261014_091355_initial';
import * as migration_20261015_075135_blob_storage_fields from './20261015_075135_blob_storage_fields';

export const migrations = [
  {
    up: migration_20261014_091355_initial.up,
    down: migration_20261014_091355_initial.down,
    name: '20261014_091355_initial',
  },
  {
    up: migration_20261015_075135_blob_storage_fields.up,
    down: migration_20261015_075135_blob_storage_fields.down,
    name: '20261015_075135_blob_storage_fields'
  },
];
