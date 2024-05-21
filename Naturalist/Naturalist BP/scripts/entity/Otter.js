import { system, world } from '@minecraft/server';
world.afterEvents.entityHurt.subscribe((data) => {
	const target = data.hurtEntity;
	if (target.typeId == "sf_nba:otter")
	{
		const inventorySize = target.getComponent("inventory").container.size;
		const item = target.getComponent("inventory").container.getItem(0);
		if (item != null)
		{
			target.dimension.spawnItem(item, target.location);
			world.playSound('random.pop', target.location);
		}
		target.getComponent("inventory").container.clearAll();
		target.runCommand("replaceitem entity @s slot.weapon.mainhand 0 air");
	}
});
system.afterEvents.scriptEventReceive.subscribe(e => {
    const entity = e.sourceEntity;
    if (e.id == "sf_nba:otter_check") {
        if (entity.typeId != "sf_nba:otter")
		{
			world.sendMessage("Error: sf_nba:otter_check can only be called from an otter.");
			return;
		}
		const itemCandidates = [ 
			"minecraft:cod", 
			"minecraft:salmon", 
			"minecraft:pufferfish", 
			"minecraft:tropical_fish", 
			"minecraft:egg", 
			"minecraft:nautilus_shell", 
			"sf_nba:snail_shell"
		]
		const item = entity.getComponent("inventory").container.getItem(0);
		if (item == null)
		{
			for (let item of itemCandidates)
				for (let i = 0; i <= 2; i += 1)
					entity.runCommand(`replaceitem entity @s[hasitem={item=${item},location=slot.weapon.mainhand,quantity=${i}}] slot.inventory 0 ${item} ${i}`);
		}
    }
})