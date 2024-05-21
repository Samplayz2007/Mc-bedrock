import { system, world } from '@minecraft/server';
const snake_roster = ["sf_nba:snake", "sf_nba:coral_snake", "sf_nba:rattlesnake"];
world.afterEvents.entityHurt.subscribe((data) => {
	const target = data.hurtEntity;
	if (snake_roster.includes(target.typeId))
	{
		const inventorySize = target.getComponent("inventory")?.container.size;
		const item = target.getComponent("inventory")?.container.getItem(0);
		if (item != null)
		{
			target.dimension.spawnItem(item, target.location);
			world.playSound('sf_nba.fox.spit', target.location);
		}
		target.getComponent("inventory").container.clearAll();
		target.runCommand("replaceitem entity @s slot.weapon.mainhand 0 air");
	}
});
world.afterEvents.entityHitEntity.subscribe((data) => {
	const source = data.damagingEntity;
	const target = data.hitEntity;
	if (source.typeId == "sf_nba:coral_snake")
	{
		target.addEffect("fatal_poison", 80);
		target.addEffect("mining_fatigue", 240);
		target.addEffect("weakness", 100);
	}
	else if (source.typeId == "sf_nba:rattlesnake")
		target.addEffect("poison", 200);
});
system.afterEvents.scriptEventReceive.subscribe(e => {
    const entity = e.sourceEntity;
    if (e.id == "sf_nba:snake_check") {
        if (!snake_roster.includes(entity.typeId))
		{
			world.sendMessage("Error: sf_nba:snake_check can only be called from a snake.");
			return;
		}
		const itemCandidates = [ "minecraft:chicken", "minecraft:rabbit", "minecraft:rabbit_foot", "minecraft:egg", "minecraft:slime_ball", "sf_nba:snail_shell" ]
		const inventory = entity.getComponent("inventory");
		if (inventory != null)
		{
			const item = inventory.container.getItem(0);
			if (item == null)
			{
				for (let item of itemCandidates)
					for (let i = 0; i <= 2; i += 1)
						entity.runCommand(`replaceitem entity @s[hasitem={item=${item},location=slot.weapon.mainhand,quantity=${i}}] slot.inventory 0 ${item} ${i}`);
			}
		}
    }
})