import { ItemStack } from "@minecraft/server";
export class MinecraftDisc {
  'minecraft:music_disc_5' = '2:58';
  'minecraft:music_disc_11' = '1:11';
  'minecraft:music_disc_13' = '2:58';
  'minecraft:music_disc_blocks' = '5:45';
  'minecraft:music_disc_cat' = '3:05';
  'minecraft:music_disc_chirp' = '3:05';
  'minecraft:music_disc_far' = '2:54';
  'minecraft:music_disc_mall' = '3:17';
  'minecraft:music_disc_mellohi' = '1:36';
  'minecraft:music_disc_otherside' = '3:15';
  'minecraft:music_disc_pigstep' = '2:28';
  'minecraft:music_disc_relic' = '3:38';
  'minecraft:music_disc_stal' = '2:30';
  'minecraft:music_disc_strad' = '3:08';
  'minecraft:music_disc_wait' = '3:58';
  'minecraft:music_disc_ward' = '4:11';
  static names() {
    return Object.getOwnPropertyNames(new this());
  }
  static validate(item) {
    return this.names().includes(item.typeId);
  }
  static getLengthFrom(id) {
    const rawLength = new this()[id];
    const arr = rawLength.split(':');
    return parseInt(arr[0]) * 60 + parseInt(arr[1]);
  }
}