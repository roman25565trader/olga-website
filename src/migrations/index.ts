import * as migration_20261014_091355_initial from './20261014_091355_initial';

export const migrations = [
  {
    up: migration_20261014_091355_initial.up,
    down: migration_20261014_091355_initial.down,
    name: '20261014_091355_initial'
  },
];
