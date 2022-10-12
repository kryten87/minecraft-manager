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

export interface MinecraftStackConfig {
  seed: string; // the level seed value (undefined)
  gameMode: MinecraftGameMode; // (survival)
  levelType: MinecraftLevelType; // (normal)
  difficulty: MinecraftDifficulty; // the world difficulty (normal)
  hardcore: boolean; // hardcore mode (false)
  allowNether: boolean; // a flag to allow/disallow nether (true)
  generateStructures: boolean; // generate villages/dungeons/etc. (true)
  spawnAnimals: boolean; // (true)
  spawnMonsters: boolean; // (true)
  spawnNpcs: boolean; // spawn villagers (true)
  announcePlayerAchievements: boolean; // a flag to allow/disallow announcements (true)
  pvp: boolean; // (false)

  // @FUTURE some of these
  motd: string; // message of the day
  whitelist: string; // CSV list of allowed players (Kryten,MWThomas,EMThomas)
  ops: string; // CSV list of admins (Kryten,MWThomas,EMThomas)
  icon: string; // URL to icon file (http://findicons.com/files/icons/2438/minecraft/256/minecraft.png)
  enableCommandBlock: boolean; // a flag to allow/disallow command blocks (true)
  snooperEnabled: boolean; // send data to snoop.minecraft.net (false)
  maxBuildHeight: number; // the max build height (256)
  maxTickTime: number; // max tick time before killing server (60000 ms)
  viewDistance: number; // set the amount of world data the server sends, in chunks (10)
  spawnProtection: number; // set the area that non-ops can not edit (0 to disable) @FUTURE
  generatorSettings: string; // special world generator settings (undefined) @FUTURE
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
    hardcore: false,
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

export enum StackListAction {
  start = 'start',
  stop = 'stop',
}
