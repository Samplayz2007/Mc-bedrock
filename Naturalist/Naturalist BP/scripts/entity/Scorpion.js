import { world } from '@minecraft/server';
export class Scorpion {
	static VARIATIONS = ['sf_nba:jungle_scorpion', 'sf_nba:desert_scorpion'];
	constructor() {
		this.onHitTarget();
	}
	onHitTarget() {
		world.afterEvents.entityHitEntity.subscribe((e) => {
			const entity = e.hitEntity;
			const source = e.damagingEntity;
			if (!Scorpion.VARIATIONS.includes(source.typeId)) return;
			entity.addEffect('poison', 20 * 6, { showParticles: true });
		});
	}
}
new Scorpion();