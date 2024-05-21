import {
  system,
  world,
  ItemStack,
  EntityInventoryComponent,
  Container,
  EntityEquippableComponent,
  EquipmentSlot,
  Entity,
  BlockPermutation,
  Direction,
} from '@minecraft/server';
import { LocalizationParser } from '../utils/LocalizationParser.js';
import { CustomEntityBucketItems } from '../item/CustomEntityBucketItems.js';
export class BucketableEntity {
  static ON_BUCKET_EVENT = 'sf_nba:bucketable_entity_interaction';
  constructor(identifier, bucketVariations, bucketableOn, liquid, sounds) {
    this.identifier = identifier;
    this.bucketVariations = bucketVariations;
    this.bucketableOn = bucketableOn || 'minecraft:water_bucket';
    this.liquid = liquid;
    this.sounds = sounds || { empty: '', fill: '' };
    this.onBucketEntity();
    this.onUnbucketEntity();
  }
  onBucketEntity() {
    system.afterEvents.scriptEventReceive.subscribe((e) => {
      const entity = e.sourceEntity;
      if (entity === null || entity.typeId !== this.identifier || e.id !== BucketableEntity.ON_BUCKET_EVENT) return;
      const nearbyPlayer = entity.dimension.getPlayers({
        location: entity.location,
        closest: 4,
        maxDistance: 8,
      });
      let source = {};
      for (let player of nearbyPlayer) {
        const equipments = player.getComponent(EntityEquippableComponent.componentId);
        const mainhandItem = equipments.getEquipment(EquipmentSlot.Mainhand);
        if (mainhandItem.typeId !== this.bucketableOn) return;
        source = {
          player,
          equipments,
          mainhandItem,
        };
      }
      const mainhandAmount = source.mainhandItem.amount - 1;
      world.playSound(this.sounds.fill, entity.location);
      if (mainhandAmount !== 0) {
        source.equipments.setEquipment(
          EquipmentSlot.Mainhand,
          new ItemStack(source.mainhandItem.typeId, source.mainhandItem.amount - 1)
        );
      } else {
        source.player.runCommand(`/replaceitem entity @s slot.weapon.mainhand 0 minecraft:air 1 0`);
        source.equipments.setEquipment(EquipmentSlot.Mainhand, this.createBucketItem(entity));
        return;
      }
      const playerInventory = source.player.getComponent(EntityInventoryComponent.componentId).container;
      playerInventory.addItem(this.createBucketItem(entity));
    });
  }
  createBucketItem(entity) {
    const variant = entity?.getProperty('sf_nba:variant') || 0;
    const bucketId = !this.bucketHasVariations()
      ? this.bucketVariations
      : this.bucketVariations.getByValue(variant) || 'minecraft:bucket';
    const entityName = entity.nameTag;
    const bucket = new ItemStack(bucketId, 1);
    if (entityName) {
      bucket.nameTag = LocalizationParser.getParsedTranslatedText(entity, 'item.bucketCustomEntity.name', entityName);
    }
    entity.remove();
    return bucket;
  }
  onUnbucketEntity() {
    world.afterEvents.itemUseOn.subscribe((e) => {
      system.run(() => {
        const player = e.source;
        const clickedBlock = e.block;
        const clickedFace = e.blockFace;
        const spawnAt = {
          x:
            clickedFace === Direction.East
              ? clickedBlock.x + 1 + 0.5
              : clickedFace === Direction.West
              ? clickedBlock.x - 1 + 0.5
              : clickedBlock.x + 0.5,
          y:
            clickedFace === Direction.Up
              ? clickedBlock.y + 1
              : clickedFace === Direction.Down
              ? clickedBlock.y - 1
              : clickedBlock.y,
          z:
            clickedFace === Direction.North
              ? clickedBlock.z - 1 + 0.5
              : clickedFace === Direction.South
              ? clickedBlock.z + 1 + 0.5
              : clickedBlock.z + 0.5,
        };
        const item = e.itemStack;
        let entitySpawned;
        if (
          !item.typeId.startsWith('sf_nba') ||
          !item.typeId.endsWith(this.bucketVariations.parentId || this.bucketVariations)
        )
          return;
        if (!player.dimension.getBlock(spawnAt).isAir && !player.dimension.getBlock(spawnAt).isLiquid) {
          player.getComponent(EntityEquippableComponent.componentId).setEquipment(EquipmentSlot.Mainhand, item);
          return;
        }
        if (this.bucketHasVariations()) {
          const variation = this.bucketVariations.getVariation(item.typeId);
          entitySpawned = player.dimension.spawnEntity(`${this.identifier}<sf_nba:set_variant_${variation}>`, spawnAt);
        } else {
          entitySpawned = player.dimension.spawnEntity(this.identifier, spawnAt);
        }
        if (item.nameTag) {
          const prefix = LocalizationParser.getTranlatedTextAndRemoveOcurrencies(entitySpawned, 'item.bucketCustomEntity.name');
          entitySpawned.nameTag = item.nameTag.replace(prefix, '');
        }
        if (this.liquid) {
          player.dimension.getBlock(spawnAt).setPermutation(BlockPermutation.resolve(this.liquid));
        }
        world.playSound(this.sounds.empty, spawnAt);
        player
          .getComponent(EntityEquippableComponent.componentId)
          .setEquipment(EquipmentSlot.Mainhand, new ItemStack('minecraft:bucket', 1));
      });
    });
  }
  bucketHasVariations() {
    return typeof this.bucketVariations === 'function';
  }
}