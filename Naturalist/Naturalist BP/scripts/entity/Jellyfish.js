import { JellyfishBuckets } from '../item/JellyfishBuckets.js';
import { MinecraftLiquid } from '../utils/MinecraftLiquid.js';
import { BucketableEntity } from './BucketableEntity.js';
export class Jellyfish extends BucketableEntity {
  static IDENTIFIER = 'sf_nba:jellyfish';
  constructor() {
    super(Jellyfish.IDENTIFIER, JellyfishBuckets, 'minecraft:water_bucket', MinecraftLiquid.FlowingWater, {
      empty: 'bucket.empty_fish',
      fill: 'bucket.fill_fish',
    });
  }
}
new Jellyfish();