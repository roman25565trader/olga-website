import * as migration_20261014_091355_initial from './20261014_091355_initial';
import * as migration_20261015_075135_blob_storage_fields from './20261015_075135_blob_storage_fields';
import * as migration_20261024_090239_klumba_texts from './20261024_090239_klumba_texts';
import * as migration_20261027_095925_versions_history from './20261027_095925_versions_history';

export const migrations = [
  {
    up: migration_20261014_091355_initial.up,
    down: migration_20261014_091355_initial.down,
    name: '20261014_091355_initial',
  },
  {
    up: migration_20261015_075135_blob_storage_fields.up,
    down: migration_20261015_075135_blob_storage_fields.down,
    name: '20261015_075135_blob_storage_fields',
  },
  {
    up: migration_20261024_090239_klumba_texts.up,
    down: migration_20261024_090239_klumba_texts.down,
    name: '20261024_090239_klumba_texts',
  },
  {
    up: migration_20261027_095925_versions_history.up,
    down: migration_20261027_095925_versions_history.down,
    name: '20261027_095925_versions_history'
  },
];
