import { system, world } from '@minecraft/server';
system.afterEvents.scriptEventReceive.subscribe(e => {
    const entity = e.sourceEntity;
    if (e.id == "sf_nba:whale_check") {
        if (entity.typeId != "sf_nba:whale")
		{
			world.sendMessage("Error: sf_nba:whale_check can only be called from a whale.");
			return;
		}
		const block = entity.dimension.getBlock({x: entity.location.x, y: entity.location.y + 2, z: entity.location.z});
		if (block != undefined)
		{
			if (block.permutation.matches("air"))
				entity.setProperty("sf_nba:can_particle", true);
			else
				entity.setProperty("sf_nba:can_particle", false);
		}
		
		const waterTestA = entity.dimension.getBlock({x: entity.location.x, y: entity.location.y, z: entity.location.z});
		const waterTestB = entity.dimension.getBlock({x: entity.location.x, y: entity.location.y + 1, z: entity.location.z});
		if ((waterTestA != undefined) && (waterTestB != undefined))
		{
			if (waterTestA.permutation.matches("water") && waterTestB.permutation.matches("water"))
				entity.setProperty("sf_nba:safely_submerged", true);
			else
				entity.setProperty("sf_nba:safely_submerged", false);
		}
    }
})