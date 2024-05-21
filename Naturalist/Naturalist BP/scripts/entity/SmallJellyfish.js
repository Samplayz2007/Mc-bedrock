import { SmallJellyfishBuckets } from '../item/SmallJellyfishBuckets.js';
import { MinecraftLiquid } from '../utils/MinecraftLiquid.js';
import { BucketableEntity } from './BucketableEntity.js';
export class SmallJellyfish extends BucketableEntity {
  static IDENTIFIER = 'sf_nba:small_jellyfish';
  constructor() {
    super(SmallJellyfish.IDENTIFIER, SmallJellyfishBuckets, 'minecraft:water_bucket', MinecraftLiquid.FlowingWater, {
      empty: 'bucket.empty_fish',
      fill: 'bucket.fill_fish',
    });
  }
}
new SmallJellyfish();