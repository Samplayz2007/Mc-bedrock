# Add a loot table for each type entity, if the entity has various random drops those can be written within the loot table
execute as @s[type=sf_nba:kiwi] run scoreboard players add sf_nba:kiwi_item_c sf_nba:jig_computer.addon_stats 1
execute as @s[type=sf_nba:kiwi] run loot spawn ~ ~ ~ loot "sf/nba/digging_rewards/kiwi.loot"
