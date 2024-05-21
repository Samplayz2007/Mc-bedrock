import { system, world } from '@minecraft/server';
const bird_roster = {
	"sf_nba:crow": {landingDistance: 3},
	"sf_nba:toucan": {landingDistance: 3},
	"sf_nba:owl": {landingDistance: 3},
	"sf_nba:raven": {landingDistance: 3},
	"sf_nba:eagle": {landingDistance: 8}
};
const defaultLandingDistance = 3;
system.afterEvents.scriptEventReceive.subscribe(e => {
    const entity = e.sourceEntity;
    if (e.id == "sf_nba:bird_landing_check") {
        if (bird_roster[entity.typeId] == null)
		{
			world.sendMessage("Error: sf_nba:bird_landing_check can only be called from a bird mob.");
			return;
		}
		let landingDistance = (bird_roster[entity.typeId] != null) ? bird_roster[entity.typeId].landingDistance : defaultLandingDistance
		const block = entity.dimension.getBlockFromRay(entity.location, {x: 0, y: -1, z: 0})?.block;
		if ((block != null) && !block.isAir && !block.isLiquid && (block.location.y < entity.location.y - landingDistance))
			entity.triggerEvent("sf_nba:bird_set_walking_mode")
    }
})