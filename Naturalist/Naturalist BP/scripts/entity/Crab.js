import { system, world, BlockInventoryComponent, Block, Entity, BlockPermutation } from '@minecraft/server';
import { MinecraftDisc } from '../item/MinecraftDiscs.js';
import { CrabBuckets } from '../item/CrabBuckets.js';
import { BucketableEntity } from './BucketableEntity.js';
import { Helper } from '../utils/Helper.js';
export class Crab extends BucketableEntity {
  static DANCING_CRABS = [];
  static IDENTIFIER = 'sf_nba:crab';
  static DANCING_EVENT = 'sf_nba:crab_is_dancing';
  static NOT_DANCING_EVENT = 'sf_nba:crab_is_not_dancing';
  static VALID_COLLECTABLE_BLOCKS = ['minecraft:sand', 'minecraft:suspicious_sand'];
  static TRY_COLLECT_SAND_EVENT = 'sf_nba:crab_try_collect_sand';
  static TRY_PLACE_SAND_EVENT = 'sf_nba:crab_try_place_sand';
  static DISC_PLAYING_INTERVAL_ID;
  static TRY_PLACE_SAND_INTERVAL_ID;
  constructor() {
    super(Crab.IDENTIFIER, CrabBuckets, 'minecraft:bucket', null, {
      empty: 'sf_nba.bucket.fill_crab',
      fill: 'sf_nba.bucket.empty_crab',
    });
    this.nearbyJukeboxPlaying();
    this.tryCollectSandBlock();
    this.tryPlaceSandBlock();
    this.onDie();
  }
  tryCollectSandBlock() {
    system.afterEvents.scriptEventReceive.subscribe((e) => {
      const entity = e.sourceEntity;
      if (entity === null || entity.typeId !== this.identifier || e.id !== Crab.TRY_COLLECT_SAND_EVENT) return;
      const block = entity.getBlockFromViewDirection({
        includeLiquidBlocks: false,
        includePassableBlocks: false,
        maxDistance: 1,
      })?.block;
      if (!block || !block.isValid()) {
        entity.triggerEvent('sf_nba:crab_search_sand_delay');
        return;
      }
      if (!this.isValidCollectableBlock(block)) return;
      this.breakSandBlock(entity, block);
    });
  }
  tryPlaceSandBlock() {
    system.afterEvents.scriptEventReceive.subscribe((e) => {
      const entity = e.sourceEntity;
      if (entity === null || entity.typeId !== this.identifier || e.id !== Crab.TRY_PLACE_SAND_EVENT) return;
      const [min, max] = [5.0, 9.0];
      const waitInterval = Math.floor(Math.random() * (max - min + 1)) + min;
      const placeChance = 7;
      Crab.TRY_PLACE_SAND_INTERVAL_ID = system.runInterval(() => {
        const chance = Math.random() * 100;
        if (chance <= placeChance) {
          this.placeSandBlock(entity);
        }
      }, 20 * waitInterval);
    });
  }
  placeSandBlock(entity) {
	if (!entity.isValid()) return;
    const entityLocation = entity.location;
    const headOffset = entity.getViewDirection();
    if (!entityLocation || !headOffset) return;
    const location = {
      x: entityLocation.x + headOffset.x,
      y: entityLocation.y,
      z: entityLocation.z + headOffset.z,
    };
    const block = entity.dimension?.getBlock(location);
    if (!block || !block.isValid()) return;
    const isAir = block.permutation.matches('minecraft:air');
    if (!isAir || !entity.isOnGround) return;
    world.playSound('dig.sand', entity.getHeadLocation(), { pitch: 1.0, volume: 1.0 });
	world.scoreboard.getObjective('sf_nba:jig_computer.addon_stats')?.addScore('sf_nba:crab_sand_m', 1);
    entity.dimension.getBlock(location).setPermutation(BlockPermutation.resolve('minecraft:sand'));
    entity.runCommand(`/replaceitem entity @s slot.weapon.mainhand 0 minecraft:air 1 0`);
    entity.triggerEvent('sf_nba:crab_search_sand_delay');
    system.clearRun(Crab.TRY_PLACE_SAND_INTERVAL_ID);
  }
  breakSandBlock(entity, block) {
    world.playSound('dig.sand', block.location, { pitch: 1.0, volume: 1.0 });
    block.setPermutation(BlockPermutation.resolve('minecraft:air'));
    entity.runCommand(`/particle sf_nba:crab_collect_sand ${Helper.stringifyVector3(block.location)}`);
    entity.runCommand(`/replaceitem entity @s slot.weapon.mainhand 0 minecraft:sand 1 0`);
    entity.triggerEvent('sf_nba:crab_try_place_sand');
  }
  nearbyJukeboxPlaying() {
    world.afterEvents.itemUseOn.subscribe((e) => {
      const item = e.itemStack;
      const clickedBlock = e.block;
      const isJukebox = clickedBlock.permutation.matches('minecraft:jukebox');
      if (!MinecraftDisc.validate(item) || !isJukebox) return;
      let discTime = 0;
      const discLength = MinecraftDisc.getLengthFrom(item.typeId) - 1;
      Crab.DISC_PLAYING_INTERVAL_ID = system.runInterval(() => {
        discTime++;
        this.updateDANCING_CRABSFrom(clickedBlock);
        if (!clickedBlock.isValid()) return;
        const container = clickedBlock.getComponent(BlockInventoryComponent.componentId)?.container;
        const hasDisc = !container ? false : container.getItem(0);
        if (discTime === discLength || !hasDisc) {
          discTime = 0;
          Crab.DANCING_CRABS.forEach((crab) => crab.triggerEvent(Crab.NOT_DANCING_EVENT));
          Crab.DANCING_CRABS = [];
          system.clearRun(Crab.DISC_PLAYING_INTERVAL_ID);
        }
      }, 20);
    });
  }
  getCrabsInsideRangeFrom(block, min = 0, max = 4) {
    return world.getDimension(block.dimension.id).getEntities({
      location: block.location,
      families: ['sf_nba:crab'],
      minDistance: min,
      maxDistance: max,
    });
  }
  updateDANCING_CRABSFrom(block) {
    this.getCrabsInsideRangeFrom(block).forEach((crab) => {
      if (Crab.DANCING_CRABS.includes(crab) && crab.isValid()) return;
      Crab.DANCING_CRABS.push(crab);
      crab.triggerEvent(Crab.DANCING_EVENT);
    });
    this.getCrabsInsideRangeFrom(block, 4.1, 16.0).forEach((crab) => {
      if (!Crab.DANCING_CRABS.includes(crab) && crab.isValid()) return;
      this.removeDacingCrab(crab);
      crab.triggerEvent(Crab.NOT_DANCING_EVENT);
    });
  }
  onDie() {
    world.afterEvents.entityDie.subscribe((e) => {
      const entity = e.deadEntity;
      if (entity.typeId !== Crab.IDENTIFIER) return;
      this.removeDacingCrab(entity);
      if (!Crab.TRY_PLACE_SAND_INTERVAL_ID) return;
      system.clearRun(Crab.TRY_PLACE_SAND_INTERVAL_ID);
    });
  }
  removeDacingCrab(entity) {
    if (!Crab.DANCING_CRABS.includes(entity)) return;
    const i = Crab.DANCING_CRABS.findIndex((crab) => entity === crab);
    Crab.DANCING_CRABS.splice(i, 1);
  }
  createBucketItem(entity) {
    this.removeDacingCrab(entity);
    return super.createBucketItem(entity);
  }
  isValidCollectableBlock(block) {
    return Crab.VALID_COLLECTABLE_BLOCKS.find((container) => block.permutation.matches(container));
  }
}
new Crab();