# Using the sf_nba.sniff_chance set in the init_sniffging, the sf_nba.sniff_goal will be set to the same value
# sf_nba.sniff_goal can be scaleable as its a separate variable from the sf_nba.sniff_chance, without manipulating the sf_nba.sniff_chance itself
# The sf_nba.sniff_rand_int will be a random number between 1 and 100, it will check if that integer is less than the sf_nba.sniff_goal, and initiate the digging if it is
scoreboard players operation @s sf_nba.sniff_goal = @s sf_nba.sniff_chance
scoreboard players random @s sf_nba.sniff_rand_int 1 100
execute as @s if score @s sf_nba.sniff_rand_int < @s sf_nba.sniff_goal run event entity @s sf_nba:digging
execute as @s if score @s sf_nba.sniff_rand_int >= @s sf_nba.sniff_goal run event entity @s sf_nba:scenting
