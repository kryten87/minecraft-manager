export enum EnvironmentVariables {
  PORTAINER_URL = 'PORTAINER_URL',
  PORTAINER_USER = 'PORTAINER_USER',
  PORTAINER_PASSWORD = 'PORTAINER_PASSWORD',
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

export interface MinecraftStackConfig {
  motd: string; // message of the day
  whitelist: string; // CSV list of allowed players
  ops: string; // CSV list of admins
  icon: string; // URL to icon file
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
  spawnNPCs: boolean; // spawn villagers (true)
  spawnProtection: number; // set the area that non-ops can not edit (0 to disable) @TODO research this
  viewDistance: number; // set the amount of world data the server sends, in chunks (???)
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
