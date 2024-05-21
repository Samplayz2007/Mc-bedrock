import { world } from '@minecraft/server';
export class Elephant {
	constructor() {
		this.identifier = 'sf_nba:elephant';
		this.onHurt();
	}
	onHurt() {
		world.afterEvents.entityHitEntity.subscribe((data) => {
			if (data.damagingEntity?.typeId === this.identifier) {
				let elephant = data.damagingEntity;
				let damaged = data.hitEntity;
				damaged.applyKnockback(damaged.location.x - elephant.location.x, damaged.location.z - elephant.location.z, 1.0, 1.0);
			} 
		});
	}
}
new Elephant();