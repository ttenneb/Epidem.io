# Epidem.io
A web-based MMO developed using TypeScript, PIXI.js, Epxress.js and socket.io. 

The game is set in a simulated city that's populated with a robust AI. The gameplay focuses on surviving in this city while a virus is spreading. Players must balance the risk of the virus, hostile players and their needs (hunger, thrist...) to win!

[A demo of the game is available (when the server isn't down for development).](http://epidem.io/) This demo contains multiple hostile AI, a tetris-like inventory system and can currently support 75+ players. 

The game is optimized using a spatial hashmap for collision detection and this [optimized pathfinding algorithm](https://mikolalysenko.github.io/l1-path-finder/www/). Even with this incredibly fast algorithm pathfinding is still problematic and takes up most of the server runtime. So a priority queue ranked by AI’s need for a path is used for further optimization. 

Controls:

E : open inventory

R : rotate item in inventory

1-9 : select item in hands

Left Click : use item in hand
