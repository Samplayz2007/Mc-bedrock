import { world } from '@minecraft/server';
export class Mammoth {
	constructor() {
		this.identifier = 'sf_nba:mammoth';
		this.onHurt();
	}
	onHurt() {
		world.afterEvents.entityHitEntity.subscribe((data) => {
			if (data.damagingEntity?.typeId === this.identifier) {
				let mammoth = data.damagingEntity;
				let damaged = data.hitEntity;
				damaged.applyKnockback(damaged.location.x - mammoth.location.x, damaged.location.z - mammoth.location.z, 1.0, 1.35);
			}
		});
	}
}
new Mammoth();