import { system, world } from "@minecraft/server";
system.afterEvents.scriptEventReceive.subscribe(e => {
    const entity = e.sourceEntity;
    if (e.id == "sf_nba:sloth_state_check") {
        if (entity.typeId != "sf_nba:sloth")
		{
			world.sendMessage("Error: sf_nba:sloth can only be called from an sloth.");
			return;
		}
		if (isOnLeaf(entity.dimension, entity.location)) {
			entity.triggerEvent("sf_nba:add_hanging");
		} else {
			entity.triggerEvent("sf_nba:add_ground");
		}
	}
})
function isOnLeaf(dimension, pos) {
	let block1 = dimension.getBlock({x: pos.x, y: pos.y - 1, z: pos.z});
	let block2 = dimension.getBlock({x: pos.x, y: pos.y - 2, z: pos.z});
	if ((block1.permutation.matches("minecraft:leaves") || block1.permutation.matches("minecraft:leaves2")) && block2.permutation.matches("minecraft:air")) return true;
	return false;
}