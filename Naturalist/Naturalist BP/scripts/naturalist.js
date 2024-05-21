import { BlockPermutation, system, world } from '@minecraft/server';
export { decrementStack };
const registerCompostables = [
  { "item": "sf_nba:snail_shell", "chance": 0.65 },
  { "item": "sf_nba:antler", "chance": 0.75 }
]
class Composter {
  static getCompostable(item) {
    return item = registerCompostables.findIndex(compostable => item === compostable.item);
  }
  static isCompostable(block) {
    for (let i = 0, state; i < 7; i++) {
      state = block.permutation.matches('minecraft:composter', {'composter_fill_level': i});
      if (state) return state;
    }
  }
  static getFillLevel(composter) {
    for (let i = 0; i < 9; i++) {
      if (composter.permutation.matches('minecraft:composter', {'composter_fill_level': i})) return i;
    }
  }
  static compostable(composter, chance) {
    let composterFillLevel = this.getFillLevel(composter);
    if (Math.random() < chance || composterFillLevel <= 0) {
      composter.setPermutation(BlockPermutation.resolve('minecraft:composter', {'composter_fill_level': ++composterFillLevel}));
      if (composterFillLevel == 7) {
        system.runTimeout(() => {
          if (this.getFillLevel(composter) != composterFillLevel || !composter.isValid()) return;
          composter.setPermutation(BlockPermutation.resolve('minecraft:composter', {'composter_fill_level': 8}));
          world.playSound('block.composter.ready', composter.location);
        }, 20);
      }
      world.playSound('block.composter.fill_success', composter.location);
    } else {
      world.playSound('block.composter.fill', composter.location);
    }
    world.playSound('item.bone_meal.use', composter.location, {pitch: Math.random() * (1.1 - 0.9) + 0.9});
    composter.dimension.spawnParticle('minecraft:crop_growth_emitter', {x: composter.x + 0.5, y: composter.y + 0.5, z: composter.z + 0.5});
  }
}
function decrementStack(equippable, player = 0) {
  if (player && player.dimension.getPlayers({gameMode:'creative'}).includes(player)) return;
  let item = equippable.getEquipment('Mainhand');
  let stack = item.amount;
  if (stack > 1) --item.amount;
  equippable.setEquipment('Mainhand', stack > 1 ? item : null);
}
world.beforeEvents.itemUseOn.subscribe(data => {
  if (
    Composter.getCompostable(data.itemStack?.typeId) > -1 &&
    Composter.isCompostable(data.block) &&
    data.source?.isSneaking === false
  ) {
    let player = data.source;
    system.run(() => {
      Composter.compostable(data.block, registerCompostables[Composter.getCompostable(data.itemStack?.typeId)].chance);
      decrementStack(player.getComponent('equippable'), player);
    });
  }
});