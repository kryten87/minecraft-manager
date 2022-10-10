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
  serverId: number;
}

export interface MinecraftStackConfig {
  motd: string; // message of the day
  whitelist: string; // CSV list of allowed players (Kryten,MWThomas,EMThomas)
  ops: string; // CSV list of admins (Kryten,MWThomas,EMThomas)
  icon: string; // URL to icon file (http://findicons.com/files/icons/2438/minecraft/256/minecraft.png)
  allowNether: boolean; // a flag to allow/disallow nether (true)
  announcePlayerAchievements: boolean; // a flag to allow/disallow announcements (true)
  enableCommandBlock: boolean; // a flag to allow/disallow command blocks (true)
  generateStructures: boolean; // generate villages/dungeons/etc. (true)
  hardcode: boolean; // hardcode mode (false)
  snooperEnabled: boolean; // send data to snoop.minecraft.net (false)
  maxBuildHeight: number; // the max build height (256)
  maxTickTime: number; // max tick time before killing server (60000 ms)
  spawnAnimals: boolean; // (true)
  spawnMonsters: boolean; // (true)
  spawnNpcs: boolean; // spawn villagers (true)
  spawnProtection: number; // set the area that non-ops can not edit (0 to disable) @TODO research this
  viewDistance: number; // set the amount of world data the server sends, in chunks (10)
  seed: string; // the level seed value (undefined)
  gameMode: MinecraftGameMode; // (survival)
  pvp: boolean; // (false)
  levelType: MinecraftLevelType; // (normal)
  generatorSettings: string; // special world generator settings (undefined) @TODO future development
  level: string; // level save name (world)
  onlineMode: boolean; // check players against MC account DB (true)
  allowFlight: boolean; // allow flight, if the mode allows (true)
  serverName: string; // server name for online finding (unefined)
}

export const defaultMinecraftConfig: Partial<MinecraftStackConfig> =
  Object.freeze({
    whitelist: 'Kryten,MWThomas,EMThomas',
    ops: 'Kryten,MWThomas,EMThomas',
    icon: 'http://findicons.com/files/icons/2438/minecraft/256/minecraft.png',
    allowNether: true,
    announcePlayerAchievements: true,
    enableCommandBlock: true,
    generateStructures: true,
    hardcode: false,
    snooperEnabled: false,
    maxBuildHeight: 256,
    maxTickTime: 60000,
    spawnAnimals: true,
    spawnMonsters: true,
    spawnNpcs: true,
    spawnProtection: 0,
    viewDistance: 10,
    gameMode: MinecraftGameMode.survival,
    pvp: false,
    levelType: MinecraftLevelType.normal,
    onlineMode: true,
    allowFlight: true,
    difficulty: MinecraftDifficulty.normal,
  });

export enum PortainerStackType {
  swarm = 1,
  compose = 2,
}
