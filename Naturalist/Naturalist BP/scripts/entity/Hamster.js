import { system, world } from "@minecraft/server";
system.afterEvents.scriptEventReceive.subscribe(e => {
	const entity = e.sourceEntity;
	if (e.id == "sf_nba:hamster_in_wheel_launch") {
		if (entity.typeId != "sf_nba:hamster") {
			world.sendMessage("Error: sf_nba:hamster_in_wheel_launch can only be called from a hamster.");
			return;
		}
		let hamster_wheel = entity.dimension.getEntities({
			location: entity.location,
			families: ["sf_nba:hamster_wheel"],
			minDistance: 0,
			maxDistance: 0.5,
			closest: 1
		});
		if (hamster_wheel.length == 0) return;
		let rot = hamster_wheel[0].getRotation().y;
		let dir = Math.round(((rot + 180) / 360) * 4) % 4;
		world.scoreboard.getObjective('sf_nba:jig_computer.addon_stats')?.addScore('sf_nba:hamsters_fl', 1);
		entity.runCommand("ride @s stop_riding");
		if (dir == 0) entity.applyImpulse({x: 0.0, y: 0.3, z: 2.0});
		else if (dir == 1) entity.applyImpulse({x: -2.0, y: 0.3, z: 0.0});
		else if (dir == 2) entity.applyImpulse({x: 0.0, y: 0.3, z: -2.0});
		else if (dir == 3) entity.applyImpulse({x: 2.0, y: 0.3, z: 0.0});
	}
})