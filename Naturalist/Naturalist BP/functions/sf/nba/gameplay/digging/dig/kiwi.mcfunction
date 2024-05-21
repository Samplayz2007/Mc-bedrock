# Using the sf_nba.dig_chance set in the init_digging, the sf_nba.dig_goal will be set to the same value
# sf_nba.dig_goal can be scaleable as its a separate variable from the sf_nba.dig_chance, without manipulating the sf_nba.dig_chance itself
# The sf_nba.dig_rand_int will be a random number between 1 and 100, it will check if that integer is less than the sf_nba.dig_goal, if it is, the digging is successful, if not, the digging is unsuccessful
scoreboard players operation @s sf_nba.dig_goal = @s sf_nba.dig_chance
scoreboard players random @s sf_nba.dig_rand_int 1 100
execute as @s if score @s sf_nba.dig_rand_int >= @s sf_nba.dig_goal run event entity @s sf_nba:digging_successful
execute as @s if score @s sf_nba.dig_rand_int < @s sf_nba.dig_goal run event entity @s sf_nba:digging_unsuccessful
