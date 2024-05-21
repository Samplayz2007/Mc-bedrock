import { system, world } from '@minecraft/server';
let rhinoAggroRegistry = {};
system.afterEvents.scriptEventReceive.subscribe(e => {
    const entity = e.sourceEntity;
	try {
		if (e.id == "sf_nba:rhino_ram_attack") {
			if (entity.typeId != "sf_nba:rhino")
			{
				world.sendMessage("Error: sf_nba:rhino_ram_attack can only be called from a rhino.");
				return;
			}
			let target = rhinoAggroRegistry[entity.id];
			if (target != null)
			{
				const chargeAction = function () {
					try {
						if ((entity.getComponent("is_stunned") != null) || entity.isInWater || !entity.isOnGround)
							return;
						let zDelta = target.location.z - entity.location.z; 
						let xDelta = target.location.x - entity.location.x; 
						let angle = Math.atan(zDelta / xDelta); 
						let xAngle = Math.cos(angle) * (xDelta >= 0 ? 1 : -1);
						let zAngle = Math.sin(angle) * (xDelta >= 0 ? 1 : -1); 
						entity.applyKnockback(xAngle, zAngle, 3.5, 0);
						entity.setRotation({x: 0, y: (xAngle > 0 ? -180 + (90 + zAngle * 90) : 180 - (90 + zAngle * 90))}); 
					}
					catch(err)
					{
					}
				};
				for (let i = 0; i < 30; i += 2)
					system.runTimeout(chargeAction, i);
			}
			else
				entity.triggerEvent("sf_nba:on_calm");
		}
		else if (e.id == "sf_nba:rhino_angry") {
			if (entity.typeId != "sf_nba:rhino")
				world.sendMessage("Warning: sf_nba:rhino_angry should only be called from a rhino.");
			const player = entity.dimension.getPlayers({location: entity.location, closest: 1})[0];
			const rhinos = entity.dimension.getEntities({type: "sf_nba:rhino", location: entity.location, maxDistance: 15});
			if (player != null)
				for (let rhino of rhinos)
					rhinoAggroRegistry[rhino.id] = player;
		}
	}
	catch (err)
	{
		console.warn(err);
	}
});
world.afterEvents.entityHurt.subscribe((data) => {
	const target = data.hurtEntity;
	if (data.damageSource.damagingEntity != null)
	{
		const sourceEntity = data.damageSource.damagingEntity;
		if ((sourceEntity.typeId == "sf_nba:rhino") && sourceEntity.hasTag("ram_attack"))
		{
			if ((target.getComponent("equippable")?.getEquipment("Offhand")?.typeId == "minecraft:shield") && target.isSneaking)
			{
				sourceEntity.clearVelocity();
				sourceEntity.triggerEvent("sf_nba:become_stunned");
			}
			else
			{
				target.applyKnockback( sourceEntity.getVelocity().x, sourceEntity.getVelocity().z, 3.0, 0.75 );
				sourceEntity.runCommand(`playanimation @s animation.sf_nba.rhino.attack`)
			}
		}
		else if (target.typeId == "sf_nba:rhino" && sourceEntity.typeId == "minecraft:player")
		{
			if (rhinoAggroRegistry[target.id] != null)
				delete(rhinoAggroRegistry[target.id]);
			rhinoAggroRegistry[target.id] = sourceEntity;
		}
	}
});