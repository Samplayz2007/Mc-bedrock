import { system, world } from '@minecraft/server';
system.afterEvents.scriptEventReceive.subscribe(e => {
    const entity = e.sourceEntity;
	try {
		if (e.id == "sf_nba:hippo_ram_attack") {
			if (entity.typeId != "sf_nba:hippo")
			{
				world.sendMessage("Error: sf_nba:hippo_ram_attack can only be called from a hippo.");
				return;
			}
			let target = entity.dimension.getEntities({families: [ "boat" ], location: entity.location, closest: 1})[0];
			if (target != null)
			{
				const chargeAction = function () {
					try {
						if (!entity.isInWater)
							return;
						let zDelta = target.location.z - entity.location.z;
						let yDelta = target.location.y - entity.location.y;
						let xDelta = target.location.x - entity.location.x; 
						let angle = Math.atan(zDelta / xDelta); 
						let xAngle = Math.cos(angle) * (xDelta >= 0 ? 1 : -1);
						let zAngle = Math.sin(angle) * (xDelta >= 0 ? 1 : -1); 
						entity.applyKnockback(xAngle, zAngle, 0.5, 0);
						entity.setRotation({x: 0, y: (xAngle > 0 ? -180 + (90 + zAngle * 90) : 180 - (90 + zAngle * 90))});
					}
					catch(err)
					{
					}
				};
				const attackAction = function () {
					try {
						if (!entity.isInWater)
							return;
						let zDelta = target.location.z - entity.location.z;
						let yDelta = target.location.y - entity.location.y;
						let xDelta = target.location.x - entity.location.x; 
						const targetDistance = Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2) + Math.pow(zDelta, 2));
						if (targetDistance < 2.5)
						{
							target.applyDamage(1.0);
							entity.runCommand(`playanimation @s animation.sf_nba.hippo.bite`);
							world.playSound(`close.wooden_door`, entity.location);
						}
					}
					catch(err)
					{
					}
				};
				for (let i = 0; i < 30; i += 2)
				{
					system.runTimeout(chargeAction, i);
					if ((i % 10) == 0)
						system.runTimeout(attackAction, i);
				}
			}
		}
	}
	catch (err)
	{
		console.warn(err);
	}
});