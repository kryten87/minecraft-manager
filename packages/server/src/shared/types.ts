export enum EnvironmentVariables {
  PORTAINER_URL = 'PORTAINER_URL',
  PORTAINER_USER = 'PORTAINER_USER',
  PORTAINER_PASSWORD = 'PORTAINER_PASSWORD',
  PORTAINER_VOLUME_PATH = 'PORTAINER_VOLUME_PATH',
}

export enum PortainerStatus {
  active = 1,
  inactive = 2,
}

export const Symbols = Object.freeze({
  Axios: Symbol('Axios'),
});

export enum MinecraftGameMode {
  creative = 'creative',
  survival = 'survival',
  adventure = 'adventure',
  spectator = 'spectator',
}

export enum MinecraftLevelType {
  normal = 'minecraft:normal',
  flat = 'minecraft:flat',
  largeBiomes = 'minecraft:large_biomes',
  amplified = 'minecraft:amplified',
  single_biome_surface = 'minecraft:single_biome_surface',
}

export enum MinecraftDifficulty {
  peaceful = 0,
  easy = 1,
  normal = 2,
  hard = 3,
}

export interface MinecraftStackMetadata {
  name: string;
  description: string;
  owner: string;
}

export enum PortainerStackType {
  swarm = 1,
  compose = 2,
}

export enum StackListAction {
  start = 'start',
  stop = 'stop',
}
