import { system, world } from '@minecraft/server';
import { SnailBuckets } from '../item/SnailBuckets.js';
import { BucketableEntity } from './BucketableEntity.js';
export class Snail extends BucketableEntity {
  static IDENTIFIER = 'sf_nba:snail';
  constructor() {
    super(Snail.IDENTIFIER, SnailBuckets, 'minecraft:bucket', null, {
      empty: 'sf_nba.bucket.fill_snail',
      fill: 'sf_nba.bucket.empty_snail',
    });
    this.onCrush();
  }
  onCrush() {
    system.afterEvents.scriptEventReceive.subscribe((e) => {
      const entity = e.sourceEntity;
      if (entity == null || entity.typeId !== Snail.IDENTIFIER || e.id !== 'sf_nba:snail_crush_check') return;
      const player = entity.dimension.getPlayers({ location: entity.location, closest: 1 })[0];
      let safeLanding = false;
      if (player.getVelocity().y < 0 && !safeLanding) {
        entity.applyDamage(2, { cause: 'entityAttack', damagingEntity: player });
        return;
      }
      entity.triggerEvent('sf_nba:snail_survived_crush');
    });
  }
}
new Snail();