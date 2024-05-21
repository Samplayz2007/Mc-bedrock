import { BlockInventoryComponent, Container, system, world } from '@minecraft/server';
import { Helper } from '../utils/Helper';

export class Raccoon {
  static IDENTIFIER = 'sf_nba:raccoon';
  static VALID_CONTAINERS = ['minecraft:chest', 'minecraft:trapped_chest', 'minecraft:barrel'];
  static SEARCHING_ITEM_EVENT = 'sf_nba:raccoon_searching_item';
  static CANCEL_SEARCHING_ITEM_EVENT = 'sf_nba:raccoon_cancel_searching_item';
  static HOLDING_ITEM_EVENT = 'sf_nba:raccoon_holding_item';
  static SEARCH_CONTAINER_DELAY_EVENT = 'sf_nba:raccoon_search_container_delay';

  static TRIGGERED_CONTAINERS = [];

  constructor() {
    this.onSearchingItemOnChest();
    this.onCancelSearchingItemOnChest();
    this.onBreakTriggeredContainer();
  }

  onSearchingItemOnChest() {
    system.afterEvents.scriptEventReceive.subscribe((e) => {
      const entity = e.sourceEntity;

      if (entity === null || entity.typeId !== Raccoon.IDENTIFIER || e.id !== Raccoon.SEARCHING_ITEM_EVENT) return;

      const containerBlock = entity.getBlockFromViewDirection({
        includeLiquidBlocks: false,
        includePassableBlocks: false,
      })?.block;

      if (containerBlock === null) {
        entity.triggerEvent(Raccoon.SEARCH_CONTAINER_DELAY_EVENT);
        return;
      }

      if (!this.isValidContainer(containerBlock)) {
        entity.triggerEvent(Raccoon.SEARCH_CONTAINER_DELAY_EVENT);
        return;
      }

      Raccoon.TRIGGERED_CONTAINERS.push({
        block: containerBlock,
        entity: entity
      });

      entity.setProperty('sf_nba:container_type', this.getTriggeredContainerIdentifier(containerBlock));

      /** @type {Container} */
      const inventory = containerBlock.getComponent(BlockInventoryComponent.componentId).container;
      const itemsCount = inventory.size - inventory.emptySlotsCount;
      const items = [];

      const [min, max] = [3.0, 9.0];
      const waitTime = Math.floor(Math.random() * (max - min + 1)) + min;

      system.runTimeout(() => {
        if (!entity.isValid()) {
          this.removeTriggeredContainer(containerBlock);
          return;
        }

        if (entity.getProperty('sf_nba:search_state') !== 'searching_item') {
          this.removeTriggeredContainer(containerBlock);
          return;
        }

        if (itemsCount === 0) {
          entity.triggerEvent(Raccoon.SEARCH_CONTAINER_DELAY_EVENT);
          this.removeTriggeredContainer(containerBlock);
          return;
        }

        for (let i = 0; i < inventory.size; i++) {
          const item = inventory.getItem(i);

          if (!item) continue;
          if (!Helper.isItemOrItemBlock(item)) continue;

          items.push({
            slot: i,
            identifier: item.typeId,
            stack: item.clone(),
          });
        }

        if (items.length === 0) {
          entity.triggerEvent(Raccoon.SEARCH_CONTAINER_DELAY_EVENT);
          this.removeTriggeredContainer(containerBlock);
          return;
        }

        const slot = Math.floor(Math.random() * itemsCount);
        const item = items[slot];

        entity.runCommand(`/replaceitem entity @s slot.weapon.mainhand 0 ${item.identifier} 1`);
        entity.triggerEvent(Raccoon.HOLDING_ITEM_EVENT);

        const newAmount = item.stack.amount - 1;

        if (newAmount === 0) {
          inventory.setItem(item.slot, null);
          return;
        }

        item.stack.amount = newAmount;

        inventory.setItem(item.slot, item.stack);
        this.removeTriggeredContainer(containerBlock);
      }, 20 * waitTime);
    });
  }

  onCancelSearchingItemOnChest() {
    system.afterEvents.scriptEventReceive.subscribe((e) => {
      const entity = e.sourceEntity;

      if (entity === null || entity.typeId !== Raccoon.IDENTIFIER || e.id !== Raccoon.CANCEL_SEARCHING_ITEM_EVENT) return;

      entity.triggerEvent(Raccoon.SEARCH_CONTAINER_DELAY_EVENT);
    });
  }

  onBreakTriggeredContainer() {
    world.afterEvents.playerBreakBlock.subscribe((e) => {
      const { block } = e;
      const triggeredBlock = Raccoon.TRIGGERED_CONTAINERS.find((b) =>
        Helper.compareVector3(b.block.location, block.location)
      );

      if (!triggeredBlock) return;
      const raccoon = triggeredBlock.entity;

      if (!raccoon.isValid()) {
        this.removeTriggeredContainer(block);
        return;
      }

      const searchState = raccoon.getProperty('sf_nba:search_state');

      if (searchState !== 'searching_item') return;
      raccoon.triggerEvent(Raccoon.SEARCH_CONTAINER_DELAY_EVENT);

      this.removeTriggeredContainer(block);
    });
  }

  /**
   * Remove the Triggered Container from the {@link Raccoon.TRIGGERED_CONTAINERS} list.
   */
  removeTriggeredContainer(block) {
    const i = Raccoon.TRIGGERED_CONTAINERS.findIndex((container) => block === container);
    Raccoon.TRIGGERED_CONTAINERS.splice(i, 1);
  }

  getTriggeredContainerIdentifier(block) {
    return Raccoon.VALID_CONTAINERS.find((container) => block?.permutation.matches(container)).replace('minecraft:', '');
  }

  /**
   * Checks if the block is a valid container block.
   * Can be used to limit the containers that can be "opened" by the Raccoon.
   * @param {Block} block The block at ViewDirection.
   * @returns {boolean}
   */
  isValidContainer(block) {
    return Raccoon.VALID_CONTAINERS.find((container) => block?.permutation.matches(container)) ?? false;
  }
}

new Raccoon();
