import { world, system } from "@minecraft/server";
const initTextDelay = 300;
const playerInitList = {};
world.afterEvents.playerSpawn.subscribe(data => {
  if (data.player?.getDynamicProperty('sf_nba:player_first_spawn') !== false) {
    const player = data.player;
    player.setDynamicProperty('sf_nba:player_first_spawn', false);
    playerInitList[player.id] = world.getAbsoluteTime();
	player.runCommandAsync('function sf/nba/jig_stats_init');
    player.runCommandAsync('loot spawn ^^^2 loot "sf/nba/info_book.loot"');
  }
});

world.afterEvents.itemUse.subscribe(data => {
  if (data.itemStack?.typeId === 'sf_nba:info_book') {
    const player = data.source;
    player.onScreenDisplay.setActionBar({translate: 'action.sf_nba:book.ready'});
    player.runCommand('loot replace entity @s slot.weapon.mainhand 0 loot "sf/nba/info_book.loot"');
  }
});
function announceBook() {
	for (const player of Object.keys(playerInitList)) {
		if (world.getAbsoluteTime() > playerInitList[player] + initTextDelay)
		{
			world.getEntity(player)?.runCommandAsync(`titleraw @s actionbar {"rawtext":[{"translate":"action.sf_nba:book.appeared"}]}`);
			delete(playerInitList[player]);
		}
	}
}
system.runInterval(announceBook);