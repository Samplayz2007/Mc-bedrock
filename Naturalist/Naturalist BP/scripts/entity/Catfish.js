import { MinecraftLiquid } from '../utils/MinecraftLiquid.js';
import { BucketableEntity } from './BucketableEntity.js';
export class Catfish extends BucketableEntity {
  static IDENTIFIER = 'sf_nba:catfish';
  constructor() {
    super(Catfish.IDENTIFIER, 'sf_nba:catfish_bucket', 'minecraft:water_bucket', MinecraftLiquid.FlowingWater, {
      empty: 'sf_nba.bucket.empty_catfish',
      fill: 'sf_nba.bucket.fill_catfish',
    });
  }
}
new Catfish();