import { system, world } from "@minecraft/server";
class Clam {
    constructor() {
        this.launch();
    }
    launch() {
        system.afterEvents.scriptEventReceive.subscribe(e => {
            const entity = e.sourceEntity;
            if (e.id == "sf_nba:clam_launch") {
                if (entity.typeId != "sf_nba:clam") {
                    world.sendMessage("Error: sf_nba:clam_launch can only be called from a clam.");
                    return;
                }
                let entities_on_top = entity.dimension.getEntities({
                    location: entity.location,
                    families: ["mob"],
                    excludeFamilies: ["sf_nba:clam"],
                    minDistance: 0,
                    maxDistance: 1.4
                }).concat(
                    entity.dimension.getPlayers({
                    location: entity.location,
                    minDistance: 0,
                    maxDistance: 1.4
                }));
                if (entities_on_top.length != 0) {
                    let launchPower = this.getLaunchPower(entity);
                    entities_on_top.forEach((launchable) => {
                        if (launchable.isValid()) launchable.applyKnockback(0, 0, 0, launchPower);
                    });
					world.scoreboard.getObjective('sf_nba:jig_computer.addon_stats')?.addScore('sf_nba:clam_launch', 1);
                    entity.triggerEvent("sf_nba:open_launch");
                } else {
                    entity.triggerEvent("sf_nba:open");
                }
            }
        })
    }
    getLaunchPower(clam) {
        let strength = clam.getEffect("strength");
        if (strength == null) return 2;
        return 2 + (1 + strength.amplifier);
    }
}
new Clam();