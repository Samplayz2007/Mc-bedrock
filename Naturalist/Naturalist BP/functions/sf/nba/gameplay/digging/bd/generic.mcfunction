tag @s remove search

execute as @s if block ~ ~-1 ~ minecraft:dirt run tag @s add search
execute as @s if block ~ ~-1 ~ minecraft:dirt_with_roots run tag @s add search
execute as @s if block ~ ~-1 ~ minecraft:grass run tag @s add search
execute as @s if block ~ ~-1 ~ minecraft:podzol run tag @s add search
execute as @s if block ~ ~-1 ~ minecraft:sand run tag @s add search
execute as @s if block ~ ~-1 ~ minecraft:mud run tag @s add search
execute as @s if block ~ ~-1 ~ minecraft:muddy_mangrove_roots run tag @s add search
execute as @s if block ~ ~-1 ~ minecraft:moss_block run tag @s add search
execute as @s if block ~ ~-1 ~ minecraft:dirt["dirt_type"="coarse"] run tag @s add search

execute as @s[tag=search,type=sf_nba:kiwi] run function sf/nba/gameplay/digging/search/kiwi

execute as @s[tag=!search] run event entity @s sf_nba:scenting