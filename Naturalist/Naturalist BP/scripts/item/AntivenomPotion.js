import { world } from "@minecraft/server";
world.afterEvents.itemCompleteUse.subscribe(data => {
  if (data.itemStack?.typeId === 'sf_nba:antivenom_potion') {
    const target = data.source;
    target.removeEffect("poison");
    target.removeEffect("fatal_poison");
  }
});