import { system, world } from "@minecraft/server";
system.afterEvents.scriptEventReceive.subscribe(e => {
	const entity = e.sourceEntity;
	if (e.id == "sf_nba:lizard_tail_flop") {
		if (entity.typeId != "sf_nba:lizard_tail") {
			world.sendMessage("Error: sf_nba:lizard_tail_flop can only be called from a lizard tail.");
			return;
		}
		entity.applyImpulse({x: ((Math.random() * 2.0) - 1.0) * 0.05, y: 0.4, z: ((Math.random() * 2.0) - 1.0) * 0.05});
	}
})