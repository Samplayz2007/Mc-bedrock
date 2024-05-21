# Initialize scoreboards
scoreboard objectives add sf_nba.sniff_chance dummy
scoreboard objectives add sf_nba.sniff_goal dummy
scoreboard objectives add sf_nba.sniff_rand_int dummy
scoreboard players set @s sf_nba.sniff_chance 0
scoreboard players set @s sf_nba.sniff_goal 0
scoreboard players set @s sf_nba.sniff_rand_int 0

# For each attempt of the entity searching, it has a 0-100% chance of finding a target to dig at while it is randomly moving
# The search chance is scaled from 0 to 100, by default I recommend setting it to 50
scoreboard players set @s sf_nba.sniff_chance 50

# For each attempt of the entity searching, it will check if the block below it is a valid block for it to dig at
# If the block is valid, it will run the function to determine whether or not it will dig there using the sf_nba.sniff_chance
# If there are many blocks possible for the entity to dig on, will nest these block checks into another function 
function sf/nba/gameplay/digging/bd/generic