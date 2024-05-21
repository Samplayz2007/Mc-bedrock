import {world, system, BlockPermutation} from "@minecraft/server"
const logMap = {
    "minecraft:acacia_log": "minecraft:stripped_acacia_log",
    "minecraft:birch_log": "minecraft:stripped_birch_log",
    "minecraft:cherry_log": "minecraft:stripped_cherry_log",
    "minecraft:dark_oak_log": "minecraft:stripped_dark_oak_log",
    "minecraft:jungle_log": "minecraft:stripped_jungle_log",
    "minecraft:mangrove_log": "minecraft:stripped_mangrove_log",
    "minecraft:oak_log": "minecraft:stripped_oak_log",
    "minecraft:spruce_log": "minecraft:stripped_spruce_log"
}
const axisTypes = [ "x", "y", "z" ]
system.afterEvents.scriptEventReceive.subscribe(e => {
    const entity = e.sourceEntity;
    if (e.id == "sf_nba:beaver_chew") {
        if (entity.typeId != "sf_nba:beaver")
		{
			world.sendMessage("Error: sf_nba:beaver_chew can only be called from a beaver.");
			return;
		}
		let blockFound = false;
		try {
			const block = entity.dimension.getBlockFromRay(entity.location, entity.getViewDirection(), {maxDistance: 1})?.block;
			if (block != null)
				blockFound = try_convert_log(block);
			if (blockFound)
				return;
		}
		catch(err) {
			world.sendMessage(`${err}`);
			blockFound = false;
		}
		if (!blockFound) 
		{
			let testLocation = {x: 0, y: 0, z: 0}
			for (let x = -1; (x <= 1) && !blockFound; x += 1)
				for (let y = -1; (y <= 1) && !blockFound; y += 1)
					for (let z = -1; (z <= 1) && !blockFound; z += 1)
					{
						testLocation = {x: Math.floor(entity.location.x) + x, y: Math.floor(entity.location.y) + y, z: Math.floor(entity.location.z) + z}
						const block = entity.dimension.getBlock(testLocation);
						if (block?.permutation != null)
							blockFound = try_convert_log(block);
						if (blockFound)
							return;
					}
		}
    }
});
function try_convert_log(block) {
	for (const candidate of Object.keys(logMap))
	{
		for (const axis of axisTypes)
		{
			if (block.permutation.matches(`${candidate}`, {pillar_axis: axis}))
			{
				block.setPermutation(BlockPermutation.resolve(logMap[candidate], {pillar_axis: axis}));
				world.scoreboard.getObjective('sf_nba:jig_computer.addon_stats')?.addScore('sf_nba:beaver_logs', 1);
				return true;
			}
		}
	}
	return false;
}