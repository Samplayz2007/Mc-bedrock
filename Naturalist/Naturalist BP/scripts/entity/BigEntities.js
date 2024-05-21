import { EntityHealthComponent, world } from '@minecraft/server';
export class BigEntitys {
	constructor() {
		this.onDamageCustomHitTest();
	}
	onDamageCustomHitTest() {
		world.afterEvents.entityHitEntity.subscribe((e) => {
			if (e.hitEntity.typeId !== 'sf_nba:custom_hit_test') return;
			const entity = e.hitEntity;
			const source = e.damagingEntity;
			const parentEntityProperty = entity.getProperty('sf_nba:parent_entity');
			const customHitTestHealth = entity.getComponent(EntityHealthComponent.componentId);
			const previousHealthValue = entity.getProperty('sf_nba:previous_health') || 40;
			const parentEntity = world.getDimension(entity.dimension.id).getEntities({
				closest: 1,
				location: entity.location,
				families: ['sf_nba:' + parentEntityProperty],
			})[0];
			const damageTaken = previousHealthValue - customHitTestHealth.currentValue;
			entity.setProperty('sf_nba:previous_health', previousHealthValue - damageTaken);
			const yaw = source.getRotation().y;
			const knockbackDirection = {
				north: {
					expression: yaw > -45 && yaw <= 45,
					x: parentEntity.location.x,
					z: e.damagingEntity.location.x + parentEntity.location.x,
				},
				east: {
					expression: yaw > 45 && yaw < 135,
					x: -e.damagingEntity.location.x - parentEntity.location.x,
					z: parentEntity.location.z,
				},
				south: {
					expression: yaw <= -135 || yaw >= 135,
					x: parentEntity.location.x,
					z: -e.damagingEntity.location.x - parentEntity.location.x,
				},
				west: {
					expression: yaw > -135 && yaw <= -45,
					x: e.damagingEntity.location.x + parentEntity.location.x,
					z: parentEntity.location.z,
				}
			};
			for (const direction in knockbackDirection) {
				if (knockbackDirection[direction].expression) {
					const knockback = knockbackDirection[direction];
					parentEntity.applyKnockback(knockback.x, knockback.z, 0.5, 0.5);
				}
			}
			parentEntity.applyDamage(damageTaken);
		});
	}
}
new BigEntitys();