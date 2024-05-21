import { MinecraftLiquid } from '../utils/MinecraftLiquid.js';
import { BucketableEntity } from './BucketableEntity.js';
export class Bass extends BucketableEntity {
  static IDENTIFIER = 'sf_nba:bass';
  constructor() {
    super(Bass.IDENTIFIER, 'sf_nba:bass_bucket', 'minecraft:water_bucket', MinecraftLiquid.FlowingWater, {
      empty: 'sf_nba.bucket.empty_bass',
      fill: 'sf_nba.bucket.fill_bass',
    });
  }
}
new Bass();