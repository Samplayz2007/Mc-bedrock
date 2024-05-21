import { BlockPermutation, ItemStack, system, world } from '@minecraft/server';
class Vec3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  static add(a, b) {
    return new this(a.x + b.x, a.y + b.y, a.z + b.z);
  }
  static yRotated(vec3, rot) {
    rot = rot * (Math.PI/180);
    let cos = Math.cos(rot);
    let sin = Math.sin(rot);
    return new this(Math.round(10000 * (vec3.x * cos - vec3.z * sin)) / 10000, vec3.y, Math.round(10000 * (vec3.x * sin + vec3.z * cos)) / 10000);
  }
}
class bearFoodParticles {
  'sf_nba:bear_eating_honeycomb' = 1;
  'sf_nba:bear_eating_sweet_berries' = 2;
  'sf_nba:bear_eating_salmon' = 3;
  'sf_nba:bear_eating_cooked_salmon' = 4;
  'sf_nba:bear_eating_venison' = 5;
  static names() {
    return Object.getOwnPropertyNames(new this());
  }
  static getByValue(value) {
    return this.names().find(particle => new this()[particle] === value);
  }
}
function eatingEffects(bear, eatCounter) {
  if (eatCounter % 5 == 0 || eatCounter == 0) {
	if (bear.typeId == "black_bear")
	  world.playSound('sf_nba.black_bear.eat', bear.location, {volume: 0.5 * Math.floor(Math.random() * 2.0), pitch: (Math.random() - Math.random()) * 0.2 + 1.0});
	if (bear.typeId == "grizzly_bear")
	  world.playSound('sf_nba.grizzly_bear.eat', bear.location, {volume: 0.5 * Math.floor(Math.random() * 2.0), pitch: (Math.random() - Math.random()) * 0.2 + 1.0});
    let snoutVec = Vec3.add(Vec3.yRotated(new Vec3(0.07, 0.65, 1.21), bear.getRotation().y), bear.location);
    bear.dimension.spawnParticle(bearFoodParticles.getByValue(bear.getProperty('sf_nba:holding_food')), snoutVec);
  }
}
class bearHarvestGoal {
  static searchForFood(bear, range, verticalRange) {
    try {
      if (!bear.isValid())
        return;
      
      let center = {
        x: Math.floor(bear.location.x) + 0.5,
        y: Math.floor(bear.location.y),
        z: Math.floor(bear.location.z) + 0.5
      }, block;
      for (let x = center.x - range; x <= center.x + range && block != -1; x++) {
        for (let y = center.y - verticalRange; y <= center.y + verticalRange && block != -1; y++) {
          for (let z = center.z - range; z <= center.z + range && block != -1; z++) {
            const checkLocation = new Vec3(x, y, z);
            block = bear.dimension.getBlock(checkLocation);
            if (!block) continue;
            if (this.hasBearFood(block)) {
              block = -1;
              bear.triggerEvent('sf_nba:move_to_harvest');
              if (bear.dimension.getEntitiesAtBlockLocation(checkLocation).some(e => e.typeId === 'sf_nba:bear_harvest_pathfinder')) return;
              bear.dimension.spawnEntity('sf_nba:bear_harvest_pathfinder', checkLocation);
            }
          }
        }
      }
    }
    catch (err) {}
  }
  static hasBearFood(block) {
    if (
      block.permutation.matches('minecraft:sweet_berry_bush') && this.minFillLevelCheck(block, 'minecraft:sweet_berry_bush', 'growth', 2, 7) ||
      block.permutation.matches('minecraft:beehive') && this.minFillLevelCheck(block, 'minecraft:beehive', 'honey_level', 5, 5) ||
      block.permutation.matches('minecraft:bee_nest') && this.minFillLevelCheck(block, 'minecraft:bee_nest', 'honey_level', 5, 5)
    ) return true;
  }
  static getState(block, typeId, state) {
    for (let i = 0, value; i < 16 && !value; i++) {
      value = block.permutation.matches(typeId, {[state]: i});
      if (value) return i;
    }
  }
  static minFillLevelCheck(block, typeId, state, level, maxLevel) {
    for (let i = level; i < maxLevel; i++) {
      if (block.permutation.matches(typeId, {[state]: i}))
		  return true;
    }
    return false;
  }
}
world.afterEvents.entityHitEntity.subscribe(data => {
  if (data.hitEntity?.typeId == 'sf_nba:bear_harvest_pathfinder' && ((data.damagingEntity?.typeId == 'sf_nba:black_bear') || (data.damagingEntity?.typeId == 'sf_nba:brown_bear'))) {
    let bear = data.damagingEntity;
    let harvest = data.hitEntity;
    let harvestBlock = bear.dimension.getBlock(harvest.location);
    if (harvestBlock.permutation.matches('minecraft:sweet_berry_bush') && bearHarvestGoal.getState(harvestBlock, 'minecraft:sweet_berry_bush', 'growth') >= 2) {
      let age = bearHarvestGoal.getState(harvestBlock, 'minecraft:sweet_berry_bush', 'growth');
      let berryAmount = 1 + Math.floor(Math.random() * 2) + (age >= 3 ? 1 : 0);
      harvestBlock.setPermutation(BlockPermutation.resolve('minecraft:sweet_berry_bush', {'growth': 1}));
      bear.dimension.spawnItem(new ItemStack('minecraft:sweet_berries', berryAmount), harvest.location);
      world.playSound('block.sweet_berry_bush.pick', bear.location);
    }
    else if (harvestBlock.permutation.matches('minecraft:beehive') && bearHarvestGoal.getState(harvestBlock, 'minecraft:beehive', 'honey_level') >= 5) {
      let direction = bearHarvestGoal.getState(harvestBlock, 'minecraft:beehive', 'direction');
      harvestBlock.setPermutation(BlockPermutation.resolve('minecraft:beehive', {'honey_level': 0, 'direction': direction}));
      bear.dimension.spawnItem(new ItemStack('minecraft:honeycomb', 3), harvest.location);
      world.playSound('block.beehive.shear', bear.location);
    }
    else if (harvestBlock.permutation.matches('minecraft:bee_nest') && bearHarvestGoal.getState(harvestBlock, 'minecraft:bee_nest', 'honey_level') >= 5) {
      let direction = bearHarvestGoal.getState(harvestBlock, 'minecraft:bee_nest', 'direction');
      harvestBlock.setPermutation(BlockPermutation.resolve('minecraft:bee_nest', {'honey_level': 0, 'direction': direction}));
      bear.dimension.spawnItem(new ItemStack('minecraft:honeycomb', 3), harvest.location);
      world.playSound('block.beehive.shear', bear.location);
    }
    harvest.remove();
  }
});
system.afterEvents.scriptEventReceive.subscribe(data => {
  if (data.id == 'sf_nba:bear_eating' && ((data.sourceEntity.typeId == 'sf_nba:black_bear') || (data.sourceEntity.typeId == 'sf_nba:grizzly_bear'))) {
    let bear = data.sourceEntity;
    let eatCounter = 0;
    let handleEating = system.runInterval(() => {
      if (!(bear?.getProperty('sf_nba:is_sitting') && bear?.getProperty('sf_nba:holding_food')) || !bear.dimension.getBlock(bear.location)?.isValid()) return system.clearRun(handleEating);
      eatingEffects(bear, eatCounter);
      if (eatCounter > 40) {
        bear.runCommand('replaceitem entity @s slot.weapon.mainhand 0 air');
        system.run(() => bear.triggerEvent('sf_nba:on_eat'));
        return system.clearRun(handleEating);
      }
      eatCounter++;
    }, 0)
  }
  else if (data.id == 'sf_nba:bear_search_for_harvest' && ((data.sourceEntity?.typeId == 'sf_nba:black_bear') || (data.sourceEntity?.typeId == 'sf_nba:grizzly_bear'))) {
    let bear = data.sourceEntity;
    bearHarvestGoal.searchForFood(bear, 3, 2);
  }
});