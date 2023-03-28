# Treasure Search Challenge

![demo_AdobeExpress (1)](https://user-images.githubusercontent.com/43229463/225842673-2e5fc60f-a700-4655-afb2-e507699d5a07.gif)

Summary: Your job is to write the brain of an explorer. This explorer will start on a randomly generated map with scattered obstacles and stackable blocks. Somewhere on the field, there is a tower, atop which rests a golden treasure. To attain this treasure, your explorer must stack blocks and build a staircase. The object is to write a clean and understandable solution that finds the treasure in as few moves as possible.

You can learn the game mechanics with the testing engine (use the arrow keys). The testing engine will automatically pull the file *solution.js* for automated testing purposes. This will be very helpful later on.

To defeat the challenge you must implement the `Stacker` class. This class only has one required method - `turn`. The simulator will call this method once each turn, passing in the JSON object `currentCell`, containing information about the current cell your explorer is on, and the four surrounding cells.

```javascript
cell = {
  left: {type: someValue, level: someValue},
  up: {type: someValue, level: someValue},
  right: {type: someValue, level: someValue},
  down: {type: someValue, level: someValue},
  type: someValue,
  level: someValue
}
```

There are three types of tiles on the map. All are traversable except walls.

- 0 (empty)
- 1 (wall)
- 2 (block)
- 3 (gold)

All tiles also have an associated non-negative integer level (elevation off the ground). Empty cells are always at ground zero. Your explorer can only move up or down by one level at a time.

Your turn method must then return a string representing one of six possible actions:

1. "left"
1. "up"
1. "right"
1. "down"
1. "pickup"
1. "drop"

The simulator will only count a turn if the action you specified was legal. So if you try to pickup a non-existent block, it simply won't do anything.

My strategy (contained in *solution.js*):

1. Randomness Control: I check the cells around the initial position to see if they are walls or gold. This is helpful for the future, since exploration starts from one of the possible moves from the initial position. It controls randomness later on through checking if 17 random moves have been made. This usually happens when the avatar gets stuck in a certain portion of the map. If they have, the algorithm moves back to the initial starting position and then to one of the positions around the initial position that hasn't been explored. The path to get back to the initial position is generated using the A* Search algorithm using information that has been picked up through exploration.
2. Exploration: I proceed to explore the map through a variant of Breadth First Search, prioritizing moving to unexplored neighbors and explored neighbors that have unexplored neighbors. If there are no unexplored neighbors and there are no explored neighbors that have unexplored neighbors, I pick a random neighbor to move to that has already been explored. I also attempt to control this randomness through what I mentioned about randomness control in the last bullet point. In this method, I update information in a 33 by 33 grid. I do this, given that the map is a 16 by 16 grid but we don't know where we start on the map, so it accounts for all possible starting positions. I continue to explore the map until the tower is found, 28 blocks are found(the minimum required to fully build a spiral staircase around the tower) and an adequate number of obstacles are discovered(I've chosen 44 obstacles, as through testing, I've found this to be the optimal number).
3. Return to Starting Organizing Position: I move to the starting organizing position, a spot I've chosen to be 2 cells left of the tower. 
4. Explore Cells Around Tower: I then proceed to explore the cells around the tower and the cells that are around the cells around the tower. This helps me glean more information about nearby blocks and helps me keep track of the blocks that already surround the tower, so I know where to place down blocks.
5. Finding Paths from Blocks to Tower: I find paths from blocks to the starting organizing position using the block information I've picked up during exploration. I use the A* Search algorithm to do so. I sort the paths by distance, in ascending order, as I will iterate through the list of block paths in the last step. This is helpful as it reduces the amount of distance I need to travel.
6. Building First Level: I proceed to build the first level of my spiral staircase, keeping in mind if there are blocks in certain positions around the tower.
Building the Rest of the Levels and Reaching the Treasure: I then build the rest of the levels of the spiral staircase, using the paths I've generated from the blocks on the map to the tower. As they're sorted by distance in ascending order, it picks the closest blocks to the starting organizing position based on the areas of the map I've explored.
