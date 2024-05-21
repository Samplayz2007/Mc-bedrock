import { MinecraftLiquid } from '../utils/MinecraftLiquid.js';
import { BucketableEntity } from './BucketableEntity.js';
export class Piranha extends BucketableEntity {
  static IDENTIFIER = 'sf_nba:piranha';
  constructor() {
    super(Piranha.IDENTIFIER, 'sf_nba:piranha_bucket', 'minecraft:water_bucket', MinecraftLiquid.FlowingWater, {
      empty: 'sf_nba.bucket.empty_piranha',
      fill: 'sf_nba.bucket.fill_piranha',
    });
  }
}
new Piranha();