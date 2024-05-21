import { BlockPermutation, ItemStack } from '@minecraft/server';
import { MinecraftItemBlockTypes } from '../item/MinecraftItemBlockTypes';
export class Helper {
  static compareVector3(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
  }
  static stringifyVector3(v, includeCommas = false) {
    const c = includeCommas ? ',' : '';
    return `${v.x}${c} ${v.y}${c} ${v.z}`;
  }
  static isItemOrItemBlock(item) {
    if (MinecraftItemBlockTypes.includes(item.typeId)) {
      return true;
    }
    try {
      BlockPermutation.resolve(item.typeId);
      return false;
    } catch (_err) {
      return true;
    }
  }
}