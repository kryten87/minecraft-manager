import {
  MinecraftDifficulty,
  MinecraftGameMode,
  MinecraftLevelType,
  MinecraftStackConfig,
} from '@minecraft-manager/shared';

export class MinecraftStack implements MinecraftStackConfig {
  motd: string; // message of the day
  whitelist: string; // CSV list of allowed players (Kryten,MWThomas,EMThomas)
  ops: string; // CSV list of admins (Kryten,MWThomas,EMThomas)
  icon: string; // URL to icon file (http://findicons.com/files/icons/2438/minecraft/256/minecraft.png)
  allowNether: boolean; // a flag to allow/disallow nether (true)
  announcePlayerAchievements: boolean; // a flag to allow/disallow announcements (true)
  enableCommandBlock: boolean; // a flag to allow/disallow command blocks (true)
  generateStructures: boolean; // generate villages/dungeons/etc. (true)
  hardcore: boolean; // hardcode mode (false)
  snooperEnabled: boolean; // send data to snoop.minecraft.net (false)
  maxBuildHeight: number; // the max build height (256)
  maxTickTime: number; // max tick time before killing server (60000 ms)
  spawnAnimals: boolean; // (true)
  spawnMonsters: boolean; // (true)
  spawnNpcs: boolean; // spawn villagers (true)
  spawnProtection: number; // set the area that non-ops can not edit (0 to disable) @FUTURE
  viewDistance: number; // set the amount of world data the server sends, in chunks (10)
  seed: string; // the level seed value (undefined)
  gameMode: MinecraftGameMode; // (survival)
  pvp: boolean; // (false)
  levelType: MinecraftLevelType; // (normal)
  generatorSettings: string; // special world generator settings (undefined) @FUTURE
  level: string; // level save name (world)
  onlineMode: boolean; // check players against MC account DB (true)
  allowFlight: boolean; // allow flight, if the mode allows (true)
  serverName: string; // server name for online finding (unefined)
  difficulty: MinecraftDifficulty; // the world difficulty (normal)
}
