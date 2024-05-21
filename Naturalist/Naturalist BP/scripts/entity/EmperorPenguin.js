import { system, world } from "@minecraft/server";
system.afterEvents.scriptEventReceive.subscribe(e => {
    const entity = e.sourceEntity;
    if (e.id == "sf_nba:emperor_penguin_fall") {
        if (entity.typeId != "sf_nba:emperor_penguin")
		{
			world.sendMessage("Error: sf_nba:emperor_penguin_fall can only be called from an emperor penguin.");
			return;
		}
		if (isOnSlipperyBlock(entity.dimension, entity.location)) {
			entity.triggerEvent("sf_nba:slide");
			let rot = entity.getViewDirection();
			entity.applyImpulse({x: rot.x * 0.5, y: 0.33, z: rot.z * 0.5});
		} else {
			entity.triggerEvent("sf_nba:fall");
		}
    }
})
function isOnSlipperyBlock(dimension, pos) {
	let block1 = dimension.getBlock(pos);
	if (block1.permutation.matches("minecraft:snow_layer")) return true;
	let block2 = dimension.getBlock({x: pos.x, y: pos.y - 1, z: pos.z});
	if (block2.permutation.matches("minecraft:snow")) return true;
	if (block2.permutation.matches("minecraft:ice")) return true;
	if (block2.permutation.matches("minecraft:blue_ice")) return true;
	if (block2.permutation.matches("minecraft:frosted_ice")) return true;
	if (block2.permutation.matches("minecraft:packed_ice")) return true;
	return false;
}