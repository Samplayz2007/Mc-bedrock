import { system, world, ItemStack, BlockPermutation } from '@minecraft/server';
world.afterEvents.playerPlaceBlock.subscribe((data) => {
	chrysalis_add(data.block.dimension.id, data.block.location);
}, { blockTypes: ["sf_nba:chrysalis_stage0", "sf_nba:chrysalis_stage1", "sf_nba:chrysalis_stage2"] });
world.afterEvents.playerBreakBlock.subscribe((data) => {
	if (data.itemStackBeforeBreak.typeId == "minecraft:shears")
		data.block.dimension.spawnItem(new ItemStack("sf_nba:chrysalis"), data.block.location);
	chrysalis_remove(data.block.dimension.id, data.block.location);
}, { blockTypes: ["sf_nba:chrysalis_stage0", "sf_nba:chrysalis_stage1", "sf_nba:chrysalis_stage2"] });
system.afterEvents.scriptEventReceive.subscribe(e => {
	const entity = e.sourceEntity;
	try {
		if (e.id == "sf_nba:chrysalis_hatched") {
			const context = e.message.split(" ");
			if (context.length == 4)
				chrysalis_remove(context[0], { x: parseInt(context[1]), y: parseInt(context[2]), z: parseInt(context[3]) });
			else
				world.sendMessage("ERROR: Incomplete chrysalis context provided in sf_nba:chrysalis_hatched");
		}
		else if (e.id == "sf_nba:chrysalis_formed") {
			if (entity.typeId != "sf_nba:cpillar") {
				world.sendMessage("Error: sf_nba:chrysalis_formed can only be called from a caterpillar.");
				return;
			}
			let testLocation = { x: 0, y: 0, z: 0 }
			for (let x = -1; x <= 1; x += 1)
				for (let y = -1; y <= 1; y += 1)
					for (let z = -1; z <= 1; z += 1) {
						testLocation = { x: Math.floor(entity.location.x) + x, y: Math.floor(entity.location.y) + y, z: Math.floor(entity.location.z) + z }
						if (entity.dimension.getBlock(testLocation)?.permutation.matches(`sf_nba:chrysalis_stage0`))
							chrysalis_add(entity.dimension.id, testLocation);
					}
		}
		else if (e.id == "sf_nba:chrysalis_reset")
			world.setDynamicProperty("sf_nba:chrysalisRegistry", "");
	}
	catch (err) {
		console.warn(err);
	}
});
function initialize_chrysalis_list() {
	if (world.getDynamicProperty("sf_nba:chrysalisRegistry") == null) {
		world.setDynamicProperty("sf_nba:chrysalisRegistry", "");
		return 1;
	}
	else
		return 2;
	return 0;
}
function chrysalis_add(dimension, location) {
	if (initialize_chrysalis_list() && !chrysalis_registered(dimension, location))
		world.setDynamicProperty("sf_nba:chrysalisRegistry", world.getDynamicProperty("sf_nba:chrysalisRegistry") + dimension + "," + location.x + "," + location.y + "," + location.z + "|");
}
function chrysalis_remove(dimension, location) {
	if (initialize_chrysalis_list() && chrysalis_registered(dimension, location))
		world.setDynamicProperty("sf_nba:chrysalisRegistry", world.getDynamicProperty("sf_nba:chrysalisRegistry").replace(dimension + "," + location.x + "," + location.y + "," + location.z + "|", ""));
}
function chrysalis_registered(dimension, location) {
	if (initialize_chrysalis_list())
		return (world.getDynamicProperty("sf_nba:chrysalisRegistry").indexOf(dimension + "," + location.x + "," + location.y + "," + location.z) > -1);
	else
		return false;
}
function chrysalis_tick() {
	if (initialize_chrysalis_list()) {
		const chrysalisList = world.getDynamicProperty("sf_nba:chrysalisRegistry").split("|");
		let chrysalisInfo = [];
		for (let chrysalis of chrysalisList) {
			if ((chrysalis.length > 0) && (Math.random() > 0.9)) {
				chrysalisInfo = chrysalis.split(",");
				if (chrysalis_loaded(chrysalisInfo[0], { x: parseInt(chrysalisInfo[1]), y: parseInt(chrysalisInfo[2]), z: parseInt(chrysalisInfo[3]) }))
					chrysalis_grow(chrysalisInfo[0], { x: parseInt(chrysalisInfo[1]), y: parseInt(chrysalisInfo[2]), z: parseInt(chrysalisInfo[3]) })
			}
		}
	}
}
function chrysalis_loaded(dimension, location) {
	try {
		return world.getDimension(dimension.substring(dimension)).getBlock(location).isValid();
	}
	catch (err) {
		return false;
	}
}
function chrysalis_grow(dimension, location) {
	const cardinalDirections = ["north", "east", "south", "west"];
	const targetDimension = world.getDimension(dimension.substring(dimension));
	const block = targetDimension.getBlock(location);
	let match = false;
	for (let direction of cardinalDirections) {
		for (let i = 2; i >= 0; i -= 1) {
			if (i == 2) {
				if (block?.permutation.matches(`sf_nba:chrysalis_stage${i}`, { "minecraft:block_face": direction })) {
					targetDimension.spawnEntity("sf_nba:butterfly", location);
					world.scoreboard.getObjective('sf_nba:jig_computer.addon_stats')?.addScore('sf_nba:butterfly_h', 1);
					block.setPermutation(BlockPermutation.resolve("minecraft:air"));
					chrysalis_remove(dimension, location);
					match = true;
				}
			}
			else {
				if (block?.permutation.matches(`sf_nba:chrysalis_stage${i}`, { "minecraft:block_face": direction })) {
					block.setPermutation(BlockPermutation.resolve(`sf_nba:chrysalis_stage${i + 1}`, { "minecraft:block_face": direction }));
					match = true;
				}
			}
		}
	}
	if (!match)
		chrysalis_remove(dimension, location);
}
system.runInterval(chrysalis_tick, 200);