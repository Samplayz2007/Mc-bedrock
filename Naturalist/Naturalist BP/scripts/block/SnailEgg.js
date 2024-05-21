import { system, world, ItemStack, BlockPermutation } from '@minecraft/server';
const timeToHatch = 24000 * 3;
world.afterEvents.playerPlaceBlock.subscribe((data) => {
	snailegg_add(data.block.dimension.id, data.block.location);
}, {blockTypes: [ "sf_nba:snail_eggs" ]});
world.afterEvents.playerBreakBlock.subscribe((data) => {
	if (data.itemStackBeforeBreak.typeId == "minecraft:shears")
		data.block.dimension.spawnItem(new ItemStack("sf_nba:snail_eggs"), data.block.location);
	snailegg_remove(data.block.dimension.id, data.block.location);
}, {blockTypes: [ "sf_nba:snail_eggs" ]});
system.afterEvents.scriptEventReceive.subscribe(e => {
    const entity = e.sourceEntity;
	try {
		if (e.id == "sf_nba:snailegg_hatched")
		{
			const context = e.message.split(" ");
			if (context.length == 4)
				snailegg_remove(context[0], {x: parseInt(context[1]), y: parseInt(context[2]), z: parseInt(context[3])});
			else
				world.sendMessage("ERROR: Incomplete snailegg context provided in sf_nba:snailegg_hatched");
		}
		else if (e.id == "sf_nba:snailegg_formed")
		{
			if (entity.typeId != "sf_nba:snail")
			{
				world.sendMessage("Error: sf_nba:snailegg_formed can only be called from a snail.");
				return;
			}
			let testLocation = {x: 0, y: 0, z: 0}
			for (let x = -1; x <= 1; x += 1)
				for (let y = -1; y <= 1; y += 1)
					for (let z = -1; z <= 1; z += 1)
					{
						testLocation = {x: Math.floor(entity.location.x) + x, y: Math.floor(entity.location.y) + y, z: Math.floor(entity.location.z) + z}
						if (entity.dimension.getBlock(testLocation)?.permutation.matches(`sf_nba:snail_eggs`))
							snailegg_add(entity.dimension.id, testLocation);
					}
		}
		else if (e.id == "sf_nba:snailegg_reset")
			world.setDynamicProperty("sf_nba:snaileggRegistry", "");
	}
	catch (err)
	{
		console.warn(err);
	}
});
function initialize_snailegg_list() {
	if (world.getDynamicProperty("sf_nba:snaileggRegistry") == null)
	{
		world.setDynamicProperty("sf_nba:snaileggRegistry", "");
		return 1;
	}
	else
		return 2;
	return 0;
}
function snailegg_add(dimension, location) {
	if(initialize_snailegg_list() && !snailegg_registered(dimension, location))
		world.setDynamicProperty("sf_nba:snaileggRegistry", world.getDynamicProperty("sf_nba:snaileggRegistry") + dimension + "," + location.x + "," + location.y + "," + location.z + "," + world.getAbsoluteTime() + "|");
}
function snailegg_remove(dimension, location) {
	const regex = new RegExp(`${dimension},${location.x},${location.y},${location.z},\\d+\\|`,"i");
	if(initialize_snailegg_list() && snailegg_registered(dimension, location))
		world.setDynamicProperty("sf_nba:snaileggRegistry", world.getDynamicProperty("sf_nba:snaileggRegistry").replace(regex, ""));
}
function snailegg_registered(dimension, location) {
	if(initialize_snailegg_list())
		return (world.getDynamicProperty("sf_nba:snaileggRegistry").indexOf(dimension + "," + location.x + "," + location.y + "," + location.z) > -1);
	else
		return false;
}
function snailegg_tick() {
	if(initialize_snailegg_list())
	{
		const snaileggList = world.getDynamicProperty("sf_nba:snaileggRegistry").split("|");
		for (let snailegg of snaileggList)
		{
			if ((snailegg.length > 0))
			{
				let snaileggInfo = snailegg.split(",");
				let snaileggTime = parseInt(snaileggInfo[4]);
				if ((world.getAbsoluteTime() > snaileggTime + timeToHatch) && (snailegg_loaded(snaileggInfo[0], {x: parseInt(snaileggInfo[1]), y: parseInt(snaileggInfo[2]), z: parseInt(snaileggInfo[3])})))
					snailegg_hatch(snaileggInfo[0], {x: parseInt(snaileggInfo[1]), y: parseInt(snaileggInfo[2]), z: parseInt(snaileggInfo[3])})
			}
		}
	}
}
function snailegg_loaded(dimension, location) {
	try {
		return world.getDimension(dimension.substring(dimension)).getBlock(location).isValid();
	}
	catch(err) {
		return false;
	}
}
function snailegg_hatch(dimension, location) {
	const targetDimension = world.getDimension(dimension.substring(dimension));
	const block = targetDimension.getBlock(location);
	if(block?.permutation.matches("sf_nba:snail_eggs"))
	{
		targetDimension.spawnEntity("sf_nba:snail", location);
		block.setPermutation(BlockPermutation.resolve("minecraft:air"));
	}
	snailegg_remove(dimension,location);
}
system.runInterval(snailegg_tick, 20);