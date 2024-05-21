# Initialize scoreboards
scoreboard objectives add sf_nba.dig_chance dummy
scoreboard objectives add sf_nba.dig_goal dummy
scoreboard objectives add sf_nba.dig_rand_int dummy
scoreboard players set @s sf_nba.dig_chance 0
scoreboard players set @s sf_nba.dig_goal 0
scoreboard players set @s sf_nba.dig_rand_int 0

# For each attempt of the entity digging, it has a 0-100% chance of dropping an item
# The dig chance is scaled from 0 to 100, by default I recommend setting it to 50
execute as @s[type=sf_nba:kiwi] run scoreboard players set @s sf_nba.dig_chance 50

# Here the sf_nba.dig_chance will be used to determine if the entity will drop an item
execute as @s[type=sf_nba:kiwi] run function sf/nba/gameplay/digging/dig/kiwi