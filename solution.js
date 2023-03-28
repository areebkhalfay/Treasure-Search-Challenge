function Stacker() {
	let EMPTY = 0;
	let WALL = 1;
	let BLOCK = 2;
	let GOLD = 3;
	let startingPos = {x: 16, y: 16}
	let currentPos = {x:16, y:16};
	let towerPos = {x: 0, y: 0};
	let startingTowerPathPos = {x:0, y: 0};
	let aroundTowerPositions = [];
	let grid = new Array(33).fill(0).map(() => new Array(33).fill(0));
	let grid2 = new Array(33).fill(null).map(() => new Array(33).fill(null));
	let blockPositions = [];
	let blockPathMappings = [];
	let pathToOrganizingPosition = 0;
	let towerFound = false;
	let blockCount = 0;
	let wallCount = 0;
	let randomMoveCount = 0;
	let pathBacktoStart = 0;
	let pathBacktoStartPoint = 0;
	let pathBacktoStartDone = false;
	let numberOfPotentialMovesFromStart = 0;
	let runAtStart = false;
	let pathPoint = 0;
	let startingPathDone = false;
	let blockNotPickedUp = true;
	let toBlockPathPoint = 0;
	let fromBlockPathPoint = 0;
	let blockPoint = 0;
	let placementPosition = 6;
	let notBackAtStart = true;
	let cellsAroundTowerExplored = false;
	let positionAroundTowerExplored = 0;
	let cellsAroundTheCellsAroundTheTowerExplored = false;
	let positionAroundAroundTowerExplored = 0;
	let backTrackToStartingPositionPosition = 0;
	const stairsDone = {
		firstStairDone: false,
		secondStairDone: false,
		secondStairDonePrecursor: false,
		thirdStairDone: false,
		thirdStairDonePrecursor: false,
		fourthStairDone: false,
		fourthStairDonePrecursor:false,
		fifthStairDone: false,
		fifthStairDonePrecursor: false,
		sixthStairDone: false,
		sixthStairDonePrecursor: false,
		seventhStairDone: false,
		seventhStairDonePrecursor: false
	}
	const directionalCounts = {
		northEast: 0,
		up: 0,
		northWest: 0,
		right: 0,
		southWest: 0,
		southEast: 0,
		down: 0,
		left: 0
	}
	const firstLevelBlocks = []

	/**
	 * Turn method called per turn
	 * @param cell
	 * @returns {*|string}
	 */
	this.turn = function(cell) {
		//Set Randomness Control for Exploration later
		if (runAtStart === false) {
			randomnessControl(cell);
		}

		//Find Tower
		if (towerFound === false) {
			return exploration(cell);
		}

		//Find Adequate Number of Blocks
		if (blockCount < 29) {
			return exploration(cell);
		}

		//Find Adequate Number of Obstacles(Walls)
		if (wallCount < 45) {
			return exploration(cell);
		}

		//Return to starting organizing position
		if (pathToOrganizingPosition === 0) {
			let pathToOrganizingPositionUninitializedVar = pathToOrganizingPositionUninitialized(cell);
			if (pathToOrganizingPositionUninitializedVar !== "Already at Starting Point") {
				return pathToOrganizingPositionUninitializedVar;
			}
		}
		else if (!startingPathDone) {
			let pathToOrganizingPositionUnderwayVar = pathToOrganizingPositionUnderway();
			if (pathToOrganizingPositionUnderwayVar !== "Starting Path Done") {
				return pathToOrganizingPositionUnderwayVar;
			}
		}

		//Explore around the Tower and return to starting organizing position
		if (cellsAroundTowerExplored === false) {
			return exploreAroundTower(cell);
		}

		//Explore cells around the cells around the Tower
		if (cellsAroundTheCellsAroundTheTowerExplored === false) {
			return exploreCellsAroundTheCellsAroundTheTower(cell);
		}

		//Find paths from Blocks to Tower Not Around Tower
		if (blockPathMappings.length === 0) {
			blockPathMappings = blockPositions.map(function(element) {
				return blockPathFinder(grid2, startingTowerPathPos, element, cell);
			}).filter(function(element) {
				return element !== 0;
			}).sort((function(a,b) {return a.dist - b.dist}));
		}

		//Build First Level
		firstLevelBlocks.sort(function(a, b){return b-a});
		if (firstLevelBlocks.length !== 0) {
			return buildFirstLevelMainMethod(cell);
		}

		//Bring Rest of Blocks to tower and reach treasure
		if (blockPoint < 28) {
			return buildRestOfLevels(cell);
		}
	}

	/**
	 * Randomness control by counting points that avatar can return to
	 * @param cell
	 */
	function randomnessControl(cell) {
		if (cell.left.type !== WALL && cell.left.type !== GOLD) {
			numberOfPotentialMovesFromStart += 1;
		}
		if (cell.right.type !== WALL && cell.right.type !== GOLD) {
			numberOfPotentialMovesFromStart += 1
		}
		if (cell.up.type !== WALL && cell.up.type !== GOLD) {
			numberOfPotentialMovesFromStart += 1
		}
		if (cell.down.type !== WALL && cell.down.type !== GOLD) {
			numberOfPotentialMovesFromStart += 1
		}
		runAtStart = true;
	}

	/**
	 * Function for initial exploration of map, uses a variant of Breadth First Search
	 * @param cell
	 * @returns {*|string}
	 */
	function exploration(cell) {
		//If too many random moves have been done, backtrack to original position and choose new neighboring cell (Randomness Control)
		if (randomMoveCount === 17 && numberOfPotentialMovesFromStart !== 0) {
			if (pathBacktoStart === 0) {
				pathBacktoStartDone = false;
				pathBacktoStart = backtoStartingPointFinder(grid2, currentPos, startingPos, cell);
				if (pathBacktoStartPoint < pathBacktoStart.toBlock.length) {
					pathBacktoStartPoint += 1
					if (pathBacktoStart.toBlock[pathBacktoStartPoint - 1] === "left") {
						currentPos.x = currentPos.x - 1;
					} else if (pathBacktoStart.toBlock[pathBacktoStartPoint - 1] === "right") {
						currentPos.x = currentPos.x + 1;
					} else if (pathBacktoStart.toBlock[pathBacktoStartPoint - 1] === "up") {
						currentPos.y = currentPos.y - 1;
					} else {
						currentPos.y = currentPos.y + 1;
					}
					return pathBacktoStart.toBlock[pathBacktoStartPoint - 1];
				}
			}
			else if (!pathBacktoStartDone) {
				if (pathBacktoStartPoint < pathBacktoStart.toBlock.length) {
					pathBacktoStartPoint += 1
					if (pathBacktoStart.toBlock[pathBacktoStartPoint - 1] === "left") {
						currentPos.x = currentPos.x - 1;
					} else if (pathBacktoStart.toBlock[pathBacktoStartPoint - 1] === "right") {
						currentPos.x = currentPos.x + 1;
					} else if (pathBacktoStart.toBlock[pathBacktoStartPoint - 1] === "up") {
						currentPos.y = currentPos.y - 1;
					} else {
						currentPos.y = currentPos.y + 1;
					}
					return pathBacktoStart.toBlock[pathBacktoStartPoint - 1];
				}
				else {
					randomMoveCount = 0;
					pathBacktoStart = 0;
					pathBacktoStartPoint = 0;
					pathBacktoStartDone = true;
					numberOfPotentialMovesFromStart -= 1
				}
			}
		}
		// update the grid with information about current position
		if (grid[currentPos.x][currentPos.y] !== 0) {
			if (cell.type === BLOCK && !grid[currentPos.x][currentPos.y]) {
				blockCount += 1;
				blockPositions.push({x: currentPos.x, y: currentPos.y});
			}
			grid[currentPos.x][currentPos.y] = {x: currentPos.x, y: currentPos.y, type: cell.type, level: cell.level};
			grid2[currentPos.x][currentPos.y] = cell.type;
		}
		// get the list of neighboring cells and glean tower + block count information
		let neighbors = getNeighborsExploration(cell);

		// prioritize moving to cells we don't have information for
		let unexploredNeighbors = neighbors.filter(function(neighbor) {
			return grid[neighbor.x][neighbor.y] === 0;
		});

		//Add Information about surrounding cells to grid
		grid[currentPos.x - 1][currentPos.y] = {x: currentPos.x - 1, y: currentPos.y, type: cell.left.type, level: cell.left.level};
		grid2[currentPos.x - 1][currentPos.y] = cell.left.type;
		grid[currentPos.x][currentPos.y - 1] = {x: currentPos.x, y: currentPos.y - 1, type: cell.up.type, level: cell.up.level};
		grid2[currentPos.x][currentPos.y - 1] = cell.up.type;
		grid[currentPos.x + 1][currentPos.y] = {x: currentPos.x + 1, y: currentPos.y, type: cell.right.type, level: cell.right.level};
		grid2[currentPos.x + 1][currentPos.y] = cell.right.type;
		grid[currentPos.x][currentPos.y + 1] = {x: currentPos.x, y: currentPos.y + 1, type: cell.down.type, level: cell.down.level};
		grid2[currentPos.x][currentPos.y + 1] = cell.down.type;

		// if there are no unexplored neighbors, check neighbor of neighbors for next cell ideas and move to a neighbor with an unexplored cell
		// if none of the neighbors have unexplored neighbors move to a random next cell
		if (unexploredNeighbors.length === 0) {
			let nextCell = checkNeighborOfNeighborsForNextCellExploration(neighbors);
			//if there is no viable explored nextCell with unexplored neighbors, choose random
			if (nextCell === undefined) {
				let n = Math.floor(Math.random() * neighbors.length);
				nextCell = neighbors[n];
				if (numberOfPotentialMovesFromStart !== 0) {
					randomMoveCount += 1;
				}
			}
			return getMoveExploration(currentPos, nextCell);
		}

		// if there are unexplored neighbors, move to the first one
		let nextCell = unexploredNeighbors[0];
		return getMoveExploration(currentPos, nextCell);
	}

	/**
	 * Function to find path back to starting point in randomness control in exploration method (Uses A* search algorithm)
	 * @param matrix
	 * @param start
	 * @param target
	 * @param cell
	 * @returns {{fromBlock: *[], toBlock: *[], dist: any}}
	 */
	function backtoStartingPointFinder(matrix, start, target, cell) {
		const m = matrix.length;
		const n = matrix[0].length;

		// Define the heuristic function
		function heuristic(node) {
			return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
		}

		// Initialize the open and closed sets
		const openSet = [start];
		const closedSet = new Set();

		// Initialize the distance and parent arrays
		const distance = new Array(m).fill(null).map(() => new Array(n).fill(-1));
		distance[start.x][start.y] = 0;
		const parent = new Array(m).fill(null).map(() => new Array(n).fill(null));

		while (openSet.length > 0) {
			// Find the node with the lowest f-score in the open set
			let currentNode = start;
			let minFScore = Infinity;
			for (const node of openSet) {
				const fScore = distance[node.x][node.y] + heuristic(node);
				if (fScore < minFScore) {
					currentNode = node;
					minFScore = fScore;
				}
			}

			// Remove the current node from the open set and add it to the closed set
			openSet.splice(openSet.indexOf(currentNode), 1);
			closedSet.add(currentNode);

			if (currentNode.x === target.x && currentNode.y === target.y) {
				break;
			}

			const i = currentNode.x;
			const j = currentNode.y;
			for (const [di, dj] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
				const ni = i + di;
				const nj = j + dj;
				let pair = {x: ni, y: nj};
				if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[ni][nj] !== WALL && matrix[ni][nj] !== GOLD && matrix[ni][nj] !== null) {
					const tentativeDistance = distance[i][j] + 1;
					if (distance[ni][nj] === -1 || tentativeDistance < distance[ni][nj]) {
						distance[ni][nj] = tentativeDistance;
						parent[ni][nj] = currentNode;
						const neighbor = {x: ni, y: nj};
						if (!closedSet.has(neighbor)) {
							openSet.push(neighbor);
						}
					}
				}
			}
		}
		const path = [];
		let curr = target;
		while (curr !== null) {
			path.push(curr);
			curr = parent[curr.x][curr.y];
		}
		let reversePath = path.map((x) => x);
		path.reverse();
		const pathDirectionsToBlock = []
		const pathDirectionsBackToTower = []
		for (let i = 0; i < path.length; i++) {
			if (i + 1 === path.length) {
				break;
			}
			let currentPathPositionToBlock = path[i];
			let nextPathPositionToBlock = path[i+1];
			pathDirectionsToBlock.push(getMoveBlockPaths(currentPathPositionToBlock, nextPathPositionToBlock));
			let currentPathPositionBackFromBlock = reversePath[i];
			let nextPathPositionBackFromBlock = reversePath[i + 1];
			pathDirectionsBackToTower.push(getMoveBlockPaths(currentPathPositionBackFromBlock, nextPathPositionBackFromBlock));

		}
		return {dist: distance[target.x][target.y], toBlock: pathDirectionsToBlock, fromBlock: pathDirectionsBackToTower};
	}

	/**
	 * Helper Function to get directional movement given current position and next position
	 * @param currentPos
	 * @param nextPos
	 * @returns {string}
	 */
	function getMoveBlockPaths(currentPos, nextPos) {
		if (nextPos.x < currentPos.x) {
			return "left";
		} else if (nextPos.x > currentPos.x) {
			return "right";
		} else if (nextPos.y < currentPos.y) {
			return "up";
		} else if (nextPos.y > currentPos.y) {
			return "down";
		}
	}

	/**
	 * Helper function for exploration function to get the list of neighboring cells of current cell
	 * @param cell
	 * @returns {*[]}
	 */
	function getNeighborsExploration(cell) {
		let neighbors = [];

		if (cell.left.type !== WALL && cell.left.type !== GOLD) {
			if (cell.left.type === BLOCK && !grid[currentPos.x - 1][currentPos.y]) {
				blockPositions.push({x: currentPos.x - 1, y: currentPos.y});
				blockCount += 1;
			}
			neighbors.push({x: currentPos.x - 1, y: currentPos.y, type: cell.left.type, level: cell.left.level});
		} else if (cell.left.type === GOLD) {
			towerFound = true;
			towerPos.x = currentPos.x - 1;
			towerPos.y = currentPos.y;
			startingTowerPathPos.x = towerPos.x - 2;
			startingTowerPathPos.y = towerPos.y;
			aroundTowerPositionsInitializer();
		}
		else if (cell.left.type === WALL && !grid[currentPos.x - 1][currentPos.y]) {
			wallCount += 1;
		}
		if (cell.up.type !== WALL && cell.up.type !== GOLD) {
			if (cell.up.type === BLOCK && !grid[currentPos.x][currentPos.y - 1]) {
				blockPositions.push({x: currentPos.x, y: currentPos.y - 1});
				blockCount += 1;
			}
			neighbors.push({x: currentPos.x, y: currentPos.y - 1, type: cell.up.type, level: cell.up.level});
		} else if (cell.up.type === GOLD) {
			towerFound = true;
			towerPos.x = currentPos.x;
			towerPos.y = currentPos.y - 1;
			startingTowerPathPos.x = towerPos.x - 2;
			startingTowerPathPos.y = towerPos.y;
			aroundTowerPositionsInitializer();
		}
		else if (cell.up.type === WALL && !grid[currentPos.x][currentPos.y - 1]) {
			wallCount += 1;
		}
		if (cell.right.type !== WALL && cell.right.type !== GOLD) {
			if (cell.right.type === BLOCK && !grid[currentPos.x + 1][currentPos.y]) {
				blockPositions.push({x: currentPos.x + 1, y: currentPos.y});
				blockCount += 1;
			}
			neighbors.push({x: currentPos.x + 1, y: currentPos.y, type: cell.right.type, level: cell.right.level});
		} else if (cell.right.type === GOLD) {
			towerFound = true;
			towerPos.x = currentPos.x + 1;
			towerPos.y = currentPos.y;
			startingTowerPathPos.x = towerPos.x - 2;
			startingTowerPathPos.y = towerPos.y;
			aroundTowerPositionsInitializer();
		}
		else if (cell.right.type === WALL && !grid[currentPos.x + 1][currentPos.y]) {
			wallCount += 1;
		}
		if (cell.down.type !== WALL && cell.down.type !== GOLD) {
			if (cell.down.type === BLOCK && !grid[currentPos.x][currentPos.y + 1]) {
				blockPositions.push({x: currentPos.x, y: currentPos.y + 1});
				blockCount += 1;
			}
			neighbors.push({x: currentPos.x, y: currentPos.y + 1, type:cell.down.type, level: cell.down.level});
		} else if (cell.down.type === GOLD) {
			towerFound = true;
			towerPos.x = currentPos.x;
			towerPos.y = currentPos.y + 1;
			startingTowerPathPos.x = towerPos.x - 2;
			startingTowerPathPos.y = towerPos.y;
			aroundTowerPositionsInitializer();
		}
		else if (cell.down.type === WALL && !grid[currentPos.x][currentPos.y + 1]) {
			wallCount += 1;
		}

		return neighbors;
	}

	/**
	 * Helper function to get the move to reach the next cell and change the current position variable
	 * @param currentPos
	 * @param nextCell
	 * @returns {string}
	 */
	function getMoveExploration(currentPos, nextCell) {
		if (nextCell.x < currentPos.x) {
			changeCurrentPosition(currentPos, nextCell);
			return "left";
		} else if (nextCell.x > currentPos.x) {
			changeCurrentPosition(currentPos, nextCell);
			return "right";
		} else if (nextCell.y < currentPos.y) {
			changeCurrentPosition(currentPos, nextCell);
			return "up";
		} else if (nextCell.y > currentPos.y) {
			changeCurrentPosition(currentPos, nextCell);
			return "down";
		}
	}

	/**
	 * Helper function for checking Neighbors of neighbor for next cell exploration, helper function for exploration function
	 * @param neighbors
	 * @returns {undefined|*}
	 */
	function checkNeighborOfNeighborsForNextCellExploration(neighbors) {
		for (let i = 0; i < neighbors.length; i++) {
			if (grid[neighbors[i].x - 1][neighbors[i].y] === 0
				|| grid[neighbors[i].x][neighbors[i].y - 1] === 0
				|| grid[neighbors[i].x + 1][neighbors[i].y] === 0
				|| grid[neighbors[i].x][neighbors[i].y + 1] === 0){
				return neighbors[i];
			}
		}
		return undefined;
	}

	/**
	 * Helper function to change current position
	 * @param currentPos
	 * @param nextCell
	 */
	function changeCurrentPosition(currentPos, nextCell) {
		currentPos.x = nextCell.x;
		currentPos.y = nextCell.y;
	}

	/**
	 * Helper function to initialize points around tower
	 */
	function aroundTowerPositionsInitializer() {
		aroundTowerPositions.push({x: towerPos.x - 1, y: towerPos.y});
		aroundTowerPositions.push({x: towerPos.x - 1, y: towerPos.y - 1});
		aroundTowerPositions.push({x: towerPos.x, y: towerPos.y - 1});
		aroundTowerPositions.push({x: towerPos.x + 1, y: towerPos.y - 1});
		aroundTowerPositions.push({x: towerPos.x + 1, y: towerPos.y});
		aroundTowerPositions.push({x: towerPos.x - 1, y: towerPos.y + 1});
		aroundTowerPositions.push({x: towerPos.x + 1, y: towerPos.y + 1});
		aroundTowerPositions.push({x: towerPos.x, y: towerPos.y + 1});
	}

	/**
	 * Function for initializing path back to starting organizing position after exploration
	 * @param cell
	 * @returns {*|string}
	 */
	function pathToOrganizingPositionUninitialized(cell){
		pathToOrganizingPosition = blockPathFinder(grid2, currentPos, startingTowerPathPos, cell, false);
		pathPoint += 1
		if (pathToOrganizingPosition.dist === 0) {
			startingPathDone = true;
			return "Already at Starting Point"
		}
		else if (pathToOrganizingPosition.dist === -1) {
			pathToOrganizingPosition = blockPathFinder(grid2, currentPos, startingTowerPathPos, cell, true);
			if (pathToOrganizingPosition.toBlock[pathPoint - 1] === "left") {
				currentPos.x = currentPos.x - 1;
			} else if (pathToOrganizingPosition.toBlock[pathPoint - 1] === "right") {
				currentPos.x = currentPos.x + 1;
			} else if (pathToOrganizingPosition.toBlock[pathPoint - 1] === "up") {
				currentPos.y = currentPos.y - 1;
			} else {
				currentPos.y = currentPos.y + 1;
			}
			return pathToOrganizingPosition.toBlock[pathPoint - 1];
		}
		else {
			if (pathToOrganizingPosition.toBlock[pathPoint - 1] === "left") {
				currentPos.x = currentPos.x - 1;
			} else if (pathToOrganizingPosition.toBlock[pathPoint - 1] === "right") {
				currentPos.x = currentPos.x + 1;
			} else if (pathToOrganizingPosition.toBlock[pathPoint - 1] === "up") {
				currentPos.y = currentPos.y - 1;
			} else {
				currentPos.y = currentPos.y + 1;
			}
			return pathToOrganizingPosition.toBlock[pathPoint - 1];
		}
	}

	/**
	 * Function for moving back to starting organizing position after exploration
	 * @returns {*|string}
	 */
	function pathToOrganizingPositionUnderway(){
		if (pathPoint < pathToOrganizingPosition.toBlock.length) {
			pathPoint += 1
			// if (pathToOrganizingPosition.dist !== -1) {
			if (pathToOrganizingPosition.toBlock[pathPoint - 1] === "left") {
				currentPos.x = currentPos.x - 1;
			} else if (pathToOrganizingPosition.toBlock[pathPoint - 1] === "right") {
				currentPos.x = currentPos.x + 1;
			} else if (pathToOrganizingPosition.toBlock[pathPoint - 1] === "up") {
				currentPos.y = currentPos.y - 1;
			} else {
				currentPos.y = currentPos.y + 1;
			}
			return pathToOrganizingPosition.toBlock[pathPoint - 1];
		}
		else {
			startingPathDone = true;
			return "Starting Path Done";
		}
	}

	/**
	 * Function for gathering information for cells around Tower/Treasure
	 * @param cell
	 * @returns {string}
	 */
	function exploreAroundTower(cell) {
		switch(positionAroundTowerExplored) {
			//Left of Tower
			case 0:
				if (cell.right.type !== GOLD) {
					currentPos.x = currentPos.x + 1;
					return "right";
				}
				else {
					grid[currentPos.x][currentPos.y] = {x: currentPos.x, y: currentPos.y, type: cell.type, level: cell.level};
					grid2[currentPos.x][currentPos.y] = cell.type;
					if (cell.type !== BLOCK) {
						firstLevelBlocks.push(0);
					}
					currentPos.y = currentPos.y - 1;
					positionAroundTowerExplored += 1;
					return "up";
				}
			//NorthWest of Tower
			case 1:
				grid[currentPos.x][currentPos.y] = {x: currentPos.x, y: currentPos.y, type: cell.type, level: cell.level};
				grid2[currentPos.x][currentPos.y] = cell.type;
				if (cell.type !== BLOCK) {
					firstLevelBlocks.push(1);
				}
				currentPos.x = currentPos.x + 1;
				positionAroundTowerExplored += 1;
				return "right";
			//North(Up) of Tower
			case 2:
				grid[currentPos.x][currentPos.y] = {x: currentPos.x, y: currentPos.y, type: cell.type, level: cell.level};
				grid2[currentPos.x][currentPos.y] = cell.type;
				if (cell.type !== BLOCK) {
					firstLevelBlocks.push(2);
				}
				currentPos.x = currentPos.x + 1;
				positionAroundTowerExplored += 1;
				return "right";
			//NorthEast of Tower
			case 3:
				grid[currentPos.x][currentPos.y] = {x: currentPos.x, y: currentPos.y, type: cell.type, level: cell.level};
				grid2[currentPos.x][currentPos.y] = cell.type;
				if (cell.type !== BLOCK) {
					firstLevelBlocks.push(3);
				}
				currentPos.y = currentPos.y + 1;
				positionAroundTowerExplored += 1;
				return "down";
			//Right of Tower
			case 4:
				grid[currentPos.x][currentPos.y] = {x: currentPos.x, y: currentPos.y, type: cell.type, level: cell.level};
				grid2[currentPos.x][currentPos.y] = cell.type;
				if (cell.type !== BLOCK) {
					firstLevelBlocks.push(4);
				}
				currentPos.y = currentPos.y + 1;
				positionAroundTowerExplored += 1;
				return "down";
			//SouthEast of Tower
			case 5:
				grid[currentPos.x][currentPos.y] = {x: currentPos.x, y: currentPos.y, type: cell.type, level: cell.level};
				grid2[currentPos.x][currentPos.y] = cell.type;
				if (cell.type !== BLOCK) {
					firstLevelBlocks.push(5);
				}
				currentPos.x = currentPos.x - 1;
				positionAroundTowerExplored += 1;
				return "left";
			//South(Down) of Tower
			case 6:
				grid[currentPos.x][currentPos.y] = {x: currentPos.x, y: currentPos.y, type: cell.type, level: cell.level};
				grid2[currentPos.x][currentPos.y] = cell.type;
				if (cell.type !== BLOCK) {
					firstLevelBlocks.push(6);
				}
				currentPos.x = currentPos.x + 1;
				positionAroundTowerExplored += 1
				return "right";
			//Back to starting position
			case 7:
				switch (backTrackToStartingPositionPosition) {
					case 0:
						backTrackToStartingPositionPosition += 1;
						currentPos.y = currentPos.y - 1;
						return "up";
					case 1:
						backTrackToStartingPositionPosition += 1;
						currentPos.y = currentPos.y - 1;
						return "up";
					case 2:
						backTrackToStartingPositionPosition += 1;
						currentPos.x = currentPos.x - 1;
						return "left";
					case 3:
						backTrackToStartingPositionPosition += 1;
						currentPos.x = currentPos.x - 1;
						return "left";
					case 4:
						backTrackToStartingPositionPosition += 1;
						currentPos.y = currentPos.y + 1;
						return "down";
					case 5:
						backTrackToStartingPositionPosition += 1;
						currentPos.x = currentPos.x - 1;
						positionAroundTowerExplored += 1
						cellsAroundTowerExplored = true;
						return "left";
				}
		}
	}

	/**
	 * Function for exploring the cells that are around the cells around the tower
	 * @param cell
	 * @returns {string}
	 */
	function exploreCellsAroundTheCellsAroundTheTower(cell) {
		let neighbors = getNeighborsExploration(cell);
		grid[currentPos.x][currentPos.y] = {x: currentPos.x, y: currentPos.y, type: cell.type, level: cell.level};
		grid2[currentPos.x][currentPos.y] = cell.type;
		grid[currentPos.x - 1][currentPos.y] = {x: currentPos.x - 1, y: currentPos.y, type: cell.left.type, level: cell.left.level};
		grid2[currentPos.x - 1][currentPos.y] = cell.left.type;
		grid[currentPos.x][currentPos.y - 1] = {x: currentPos.x, y: currentPos.y - 1, type: cell.up.type, level: cell.up.level};
		grid2[currentPos.x][currentPos.y - 1] = cell.up.type;
		grid[currentPos.x + 1][currentPos.y] = {x: currentPos.x + 1, y: currentPos.y, type: cell.right.type, level: cell.right.level};
		grid2[currentPos.x + 1][currentPos.y] = cell.right.type;
		grid[currentPos.x][currentPos.y + 1] = {x: currentPos.x, y: currentPos.y + 1, type: cell.down.type, level: cell.down.level};
		grid2[currentPos.x][currentPos.y + 1] = cell.down.type;
		switch(positionAroundAroundTowerExplored) {
			case 0:
			case 1:
			case 14:
				positionAroundAroundTowerExplored += 1;
				currentPos.y = currentPos.y - 1;
				return "up";
			case 2:
			case 3:
			case 4:
			case 5:
				positionAroundAroundTowerExplored += 1;
				currentPos.x = currentPos.x + 1;
				return "right";
			case 6:
			case 7:
			case 8:
			case 9:
				positionAroundAroundTowerExplored += 1;
				currentPos.y = currentPos.y + 1;
				return "down";
			case 10:
			case 11:
			case 12:
			case 13:
				positionAroundAroundTowerExplored += 1;
				currentPos.x = currentPos.x - 1;
				return "left";
			case 15:
				cellsAroundTheCellsAroundTheTowerExplored = true;
				currentPos.y = currentPos.y - 1;
				return "up";
		}
	}

	/**
	 * A* Search to find shortest path from one block to starting organizing position
	 * @param matrix
	 * @param start
	 * @param target
	 * @param cell
	 * @param nearTower
	 * @returns {number|{fromBlock: *[], toBlock: *[], dist: any}}
	 */
	function blockPathFinder(matrix, start, target, cell, nearTower) {
		const m = matrix.length;
		const n = matrix[0].length;

		// Define the heuristic function
		function heuristic(node) {
			return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
		}

		// Initialize the open and closed sets
		const openSet = [start];
		const closedSet = new Set();

		// Initialize the distance and parent arrays
		const distance = new Array(m).fill(null).map(() => new Array(n).fill(-1));
		distance[start.x][start.y] = 0;
		const parent = new Array(m).fill(null).map(() => new Array(n).fill(null));

		while (openSet.length > 0) {
			// Find the node with the lowest f-score in the open set
			let currentNode = start;
			let minFScore = Infinity;
			for (const node of openSet) {
				const fScore = distance[node.x][node.y] + heuristic(node);
				if (fScore < minFScore) {
					currentNode = node;
					minFScore = fScore;
				}
			}

			// Remove the current node from the open set and add it to the closed set
			openSet.splice(openSet.indexOf(currentNode), 1);
			closedSet.add(currentNode);

			if (currentNode.x === target.x && currentNode.y === target.y) {
				break;
			}

			const i = currentNode.x;
			const j = currentNode.y;
			for (const [di, dj] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
				const ni = i + di;
				const nj = j + dj;
				let pair = {x: ni, y: nj};
				if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[ni][nj] !== WALL && matrix[ni][nj] !== GOLD && matrix[ni][nj] !== null && !isSpotAroundTower(ni, nj)) {
					const tentativeDistance = distance[i][j] + 1;
					if (distance[ni][nj] === -1 || tentativeDistance < distance[ni][nj]) {
						distance[ni][nj] = tentativeDistance;
						parent[ni][nj] = currentNode;
						const neighbor = {x: ni, y: nj};
						if (!closedSet.has(neighbor)) {
							openSet.push(neighbor);
						}
					}
				}
				if (ni >= 0 && ni < m && nj >= 0 && nj < n && matrix[ni][nj] !== WALL && matrix[ni][nj] !== GOLD && nearTower) {
					const tentativeDistance = distance[i][j] + 1;
					if (distance[ni][nj] === -1 || tentativeDistance < distance[ni][nj]) {
						distance[ni][nj] = tentativeDistance;
						parent[ni][nj] = currentNode;
						const neighbor = {x: ni, y: nj};
						if (!closedSet.has(neighbor)) {
							openSet.push(neighbor);
						}
					}
				}
			}
		}
		if (!isSpotAroundTower(target.x, target.y)) {
			const path = [];
			let curr = target;
			while (curr !== null) {
				path.push(curr);
				curr = parent[curr.x][curr.y];
			}
			let reversePath = path.map((x) => x);
			path.reverse();
			const pathDirectionsToBlock = []
			const pathDirectionsBackToTower = []
			for (let i = 0; i < path.length; i++) {
				if (i + 1 === path.length) {
					break;
				}
				let currentPathPositionToBlock = path[i];
				let nextPathPositionToBlock = path[i+1];
				pathDirectionsToBlock.push(getMoveBlockPaths(currentPathPositionToBlock, nextPathPositionToBlock));
				let currentPathPositionBackFromBlock = reversePath[i];
				let nextPathPositionBackFromBlock = reversePath[i + 1];
				pathDirectionsBackToTower.push(getMoveBlockPaths(currentPathPositionBackFromBlock, nextPathPositionBackFromBlock));

			}
			return {dist: distance[target.x][target.y], toBlock: pathDirectionsToBlock, fromBlock: pathDirectionsBackToTower};
		}
		else {
			return 0;
		}
	}

	/**
	 * Function to check if cell is around tower
	 * @param xCoordinate
	 * @param yCoordinate
	 * @returns {boolean}
	 */
	function isSpotAroundTower(xCoordinate, yCoordinate) {
		for (const aroundTowerPosition of aroundTowerPositions) {
			if (xCoordinate === aroundTowerPosition.x && yCoordinate === aroundTowerPosition.y) {
				return true;
			}
		}
	}

	/**
	 * Main method for building first level of the spiral staircase
	 * @param cell
	 * @returns {*|string}
	 */
	function buildFirstLevelMainMethod(cell) {
		if (toBlockPathPoint < blockPathMappings[blockPoint].toBlock.length) {
			toBlockPathPoint += 1;
			if (blockPathMappings[blockPoint].toBlock[toBlockPathPoint - 1] === "left") {
				currentPos.x = currentPos.x - 1;
			}
			else if (blockPathMappings[blockPoint].toBlock[toBlockPathPoint - 1] === "right") {
				currentPos.x = currentPos.x + 1;
			}
			else if (blockPathMappings[blockPoint].toBlock[toBlockPathPoint - 1] === "up") {
				currentPos.y = currentPos.y - 1;
			}
			else {
				currentPos.y = currentPos.y + 1;
			}
			return blockPathMappings[blockPoint].toBlock[toBlockPathPoint - 1];
		}
		else if (blockNotPickedUp) {
			blockNotPickedUp = false;
			return "pickup";
		}
		else if (fromBlockPathPoint < blockPathMappings[blockPoint].fromBlock.length) {
			fromBlockPathPoint += 1;
			if (blockPathMappings[blockPoint].fromBlock[fromBlockPathPoint - 1] === "left") {
				currentPos.x = currentPos.x - 1;
			}
			else if (blockPathMappings[blockPoint].fromBlock[fromBlockPathPoint - 1] === "right") {
				currentPos.x = currentPos.x + 1;
			}
			else if (blockPathMappings[blockPoint].fromBlock[fromBlockPathPoint - 1] === "up") {
				currentPos.y = currentPos.y - 1;
			}
			else {
				currentPos.y = currentPos.y + 1;
			}
			return blockPathMappings[blockPoint].fromBlock[fromBlockPathPoint - 1]
		}
		else {
			return firstLevel(cell, firstLevelBlocks[0]);
		}
	}

	/**
	 * Helper function for Building First Level
	 * @param cell
	 * @param position
	 * @returns {string}
	 */
	function firstLevel(cell, position) {
		//Left of Tower
		if (position === 0) {
			if (directionalCounts.left === 0) {
				directionalCounts.left += 1
				return "right";
			}
			else if (directionalCounts.left === 1) {
				directionalCounts.left += 1;
				return "drop";
			}
			else if (directionalCounts.left === 2){
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				firstLevelBlocks.shift();
				directionalCounts.left = 0;
				return "left";
			}
		}
		//NorthWest of Tower
		else if (position === 1) {
			if (directionalCounts.northWest === 0) {
				directionalCounts.northWest += 1
				return "right";
			} else if (directionalCounts.northWest === 1) {
				directionalCounts.northWest += 1;
				return "up";
			} else if (directionalCounts.northWest === 2) {
				directionalCounts.northWest += 1;
				return "drop";
			} else if (directionalCounts.northWest === 3) {
				directionalCounts.northWest += 1;
				return "down";
			} else if (directionalCounts.northWest === 4) {
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				firstLevelBlocks.shift();
				directionalCounts.northWest = 0;
				return "left";
			}
		}
		//North(Up) of Tower
		else if (position === 2) {
			if (directionalCounts.up === 0) {
				directionalCounts.up += 1
				return "right";
			}
			else if (directionalCounts.up === 1) {
				directionalCounts.up += 1;
				return "up";
			}
			else if (directionalCounts.up === 2) {
				directionalCounts.up += 1;
				return "right";
			}
			else if (directionalCounts.up === 3) {
				directionalCounts.up += 1;
				return "drop";
			}
			else if (directionalCounts.up === 4) {
				directionalCounts.up += 1;
				return "left";
			}
			else if (directionalCounts.up === 5) {
				directionalCounts.up += 1;
				return "down";
			}
			else if (directionalCounts.up === 6) {
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				firstLevelBlocks.shift();
				directionalCounts.up = 0;
				return "left";
			}
		}
		//NorthEast of Tower
		else if (position === 3) {
			if (directionalCounts.northEast === 0) {
				directionalCounts.northEast += 1
				return "right";
			}
			else if (directionalCounts.northEast === 1) {
				directionalCounts.northEast += 1;
				return "up";
			}
			else if (directionalCounts.northEast === 2) {
				directionalCounts.northEast += 1;
				return "right";
			}
			else if (directionalCounts.northEast === 3) {
				directionalCounts.northEast += 1;
				return "right";
			}
			else if (directionalCounts.northEast === 4) {
				directionalCounts.northEast += 1;
				return "drop";
			}
			else if (directionalCounts.northEast === 5) {
				directionalCounts.northEast += 1;
				return "left";
			}
			else if (directionalCounts.northEast === 6) {
				directionalCounts.northEast += 1;
				return "left";
			}
			else if (directionalCounts.northEast === 7) {
				directionalCounts.northEast += 1;
				return "down";
			}
			else if (directionalCounts.northEast === 8) {
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				firstLevelBlocks.shift();
				directionalCounts.northEast = 0;
				return "left";
			}
		}
		//Right of Tower
		else if (position === 4) {
			if (directionalCounts.right === 0) {
				directionalCounts.right += 1
				return "right";
			}
			else if (directionalCounts.right === 1) {
				directionalCounts.right += 1;
				return "up";
			}
			else if (directionalCounts.right === 2) {
				directionalCounts.right += 1;
				return "right";
			}
			else if (directionalCounts.right === 3) {
				directionalCounts.right += 1;
				return "right";
			}
			else if (directionalCounts.right === 4) {
				directionalCounts.right += 1;
				return "down";
			}
			else if (directionalCounts.right === 5) {
				directionalCounts.right += 1;
				return "drop";
			}
			else if (directionalCounts.right === 6) {
				directionalCounts.right += 1;
				return "up";
			}
			else if (directionalCounts.right === 7) {
				directionalCounts.right += 1;
				return "left";
			}
			else if (directionalCounts.right === 8) {
				directionalCounts.right += 1;
				return "left";
			}
			else if (directionalCounts.right === 9) {
				directionalCounts.right += 1;
				return "down";
			}
			else if (directionalCounts.right === 10){
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				firstLevelBlocks.shift();
				directionalCounts.right = 0;
				return "left";
			}
		}
		//SouthEast of Tower
		else if (position === 5) {
			if (directionalCounts.southEast === 0) {
				directionalCounts.southEast += 1;
				return "right";
			}
			else if (directionalCounts.southEast === 1) {
				directionalCounts.southEast += 1;
				return "up";
			}
			else if (directionalCounts.southEast === 2) {
				directionalCounts.southEast += 1;
				return "right";
			}
			else if (directionalCounts.southEast === 3) {
				directionalCounts.southEast += 1;
				return "right";
			}
			else if (directionalCounts.southEast === 4) {
				directionalCounts.southEast += 1;
				return "down";
			}
			else if (directionalCounts.southEast === 5) {
				directionalCounts.southEast += 1;
				return "down";
			}
			else if (directionalCounts.southEast === 6) {
				directionalCounts.southEast += 1;
				return "drop";
			}
			else if (directionalCounts.southEast === 7) {
				directionalCounts.southEast += 1;
				return "up";
			}
			else if (directionalCounts.southEast === 8) {
				directionalCounts.southEast += 1;
				return "up";
			}
			else if (directionalCounts.southEast === 9) {
				directionalCounts.southEast += 1;
				return "left";
			}
			else if (directionalCounts.southEast === 10) {
				directionalCounts.southEast += 1;
				return "left";
			}
			else if (directionalCounts.southEast === 11) {
				directionalCounts.southEast += 1;
				return "down";
			}
			else if (directionalCounts.southEast === 12) {
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				firstLevelBlocks.shift();
				directionalCounts.southEast = 0;
				return "left";
			}
		}
		//South(Down) of Tower
		else if (position === 6) {
			if (directionalCounts.down === 0) {
				directionalCounts.down += 1
				return "right";
			}
			else if (directionalCounts.down === 1) {
				directionalCounts.down += 1;
				return "up";
			}
			else if (directionalCounts.down === 2) {
				directionalCounts.down += 1;
				return "right";
			}
			else if (directionalCounts.down === 3) {
				directionalCounts.down += 1;
				return "right";
			}
			else if (directionalCounts.down === 4) {
				directionalCounts.down += 1;
				return "down";
			}
			else if (directionalCounts.down === 5) {
				directionalCounts.down += 1;
				return "down";
			}
			else if (directionalCounts.down === 6) {
				directionalCounts.down += 1;
				return "left";
			}
			else if (directionalCounts.down ===  7) {
				directionalCounts.down += 1;
				return "drop";
			}
			else if (directionalCounts.down === 8) {
				directionalCounts.down += 1;
				return "right";
			}
			else if (directionalCounts.down === 9) {
				directionalCounts.down += 1;
				return "up";
			}
			else if (directionalCounts.down === 10) {
				directionalCounts.down += 1;
				return "up";
			}
			else if (directionalCounts.down === 11) {
				directionalCounts.down += 1;
				return "left";
			}
			else if (directionalCounts.down === 12) {
				directionalCounts.down += 1;
				return "left";
			}
			else if (directionalCounts.down === 13) {
				directionalCounts.down += 1;
				return "down";
			}
			else if (directionalCounts.down === 14){
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				firstLevelBlocks.shift();
				directionalCounts.down = 0;
				return "left";
			}
		}
	}

	/**
	 * Main method for building rest of levels of the spiral staircase
	 * @param cell
	 * @returns {*|string}
	 */
	function buildRestOfLevels(cell) {
		if (toBlockPathPoint < blockPathMappings[blockPoint].toBlock.length) {
			toBlockPathPoint += 1;
			if (blockPathMappings[blockPoint].toBlock[toBlockPathPoint - 1] === "left") {
				currentPos.x = currentPos.x - 1;
			}
			else if (blockPathMappings[blockPoint].toBlock[toBlockPathPoint - 1] === "right") {
				currentPos.x = currentPos.x + 1;
			}
			else if (blockPathMappings[blockPoint].toBlock[toBlockPathPoint - 1] === "up") {
				currentPos.y = currentPos.y - 1;
			}
			else {
				currentPos.y = currentPos.y + 1;
			}
			return blockPathMappings[blockPoint].toBlock[toBlockPathPoint - 1];
		}
		else if (blockNotPickedUp) {
			blockNotPickedUp = false;
			return "pickup";
		}
		else if (fromBlockPathPoint < blockPathMappings[blockPoint].fromBlock.length) {
			fromBlockPathPoint += 1;
			if (blockPathMappings[blockPoint].fromBlock[fromBlockPathPoint - 1] === "left") {
				currentPos.x = currentPos.x - 1;
			}
			else if (blockPathMappings[blockPoint].fromBlock[fromBlockPathPoint - 1] === "right") {
				currentPos.x = currentPos.x + 1;
			}
			else if (blockPathMappings[blockPoint].fromBlock[fromBlockPathPoint - 1] === "up") {
				currentPos.y = currentPos.y - 1;
			}
			else {
				currentPos.y = currentPos.y + 1;
			}
			return blockPathMappings[blockPoint].fromBlock[fromBlockPathPoint - 1]
		}
		else {
			return dropAtSpiralStaircase(cell);
		}
	}

	/**
	 * Helper function for creating remaining levels by dropping blocks at spiral staircase
	 * @param cell
	 * @returns {string}
	 */
	function dropAtSpiralStaircase(cell) {
		if (placementPosition === 1) {
			if (!notBackAtStart) {
				if (directionalCounts.northEast === 0) {
					directionalCounts.northEast += 1
					return "right";
				} else if (directionalCounts.northEast === 1) {
					directionalCounts.northEast += 1;
					return "up";
				} else if (directionalCounts.northEast === 2) {
					directionalCounts.northEast += 1;
					return "drop";
				} else if (directionalCounts.northEast === 3) {
					notBackAtStart = true;
					if (cell.level === 2) {
						stairsDone.secondStairDonePrecursor = true;
						notBackAtStart = true;
					}
					directionalCounts.northEast += 1;
					return "down";
				}
			} else {
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				placementPosition = 6;
				if (stairsDone.secondStairDonePrecursor) {
					stairsDone.secondStairDone = true
				}
				directionalCounts.northEast = 0;
				return "left";
			}
		}
		else if (placementPosition === 2) {
			if (notBackAtStart) {
				if (directionalCounts.up === 0) {
					directionalCounts.up += 1
					return "right";
				}
				else if (directionalCounts.up === 1) {
					directionalCounts.up += 1;
					return "up";
				}
				else if (directionalCounts.up === 2) {
					directionalCounts.up += 1;
					return "right";
				}
				else if (directionalCounts.up === 3) {
					directionalCounts.up += 1;
					return "drop";
				}
				else if (directionalCounts.up === 4) {
					directionalCounts.up += 1;
					if (cell.level === 3) {
						stairsDone.thirdStairDonePrecursor = true;
					}
					return "left";
				}
				else if (directionalCounts.up === 5) {
					notBackAtStart = false;
					directionalCounts.up += 1;
					return "down";
				}
			}
			else {
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				placementPosition -= 1;
				if (stairsDone.secondStairDone) {
					notBackAtStart = true;
					placementPosition = 6;
				}
				if (stairsDone.thirdStairDonePrecursor) {
					stairsDone.thirdStairDone = true
				}
				directionalCounts.up = 0;
				return "left";
			}
		}
		else if (placementPosition === 3) {
			if (!notBackAtStart) {
				if (directionalCounts.northWest === 0) {
					directionalCounts.northWest += 1
					return "right";
				}
				else if (directionalCounts.northWest === 1) {
					directionalCounts.northWest += 1;
					return "up";
				}
				else if (directionalCounts.northWest === 2) {
					directionalCounts.northWest += 1;
					return "right";
				}
				else if (directionalCounts.northWest === 3) {
					directionalCounts.northWest += 1;
					return "right";
				}
				else if (directionalCounts.northWest === 4) {
					directionalCounts.northWest += 1;
					return "drop";
				}
				else if (directionalCounts.northWest === 5) {
					directionalCounts.northWest += 1;
					if (cell.level === 4) {
						stairsDone.fourthStairDonePrecursor = true;
					}
					return "left";
				}
				else if (directionalCounts.northWest === 6) {
					directionalCounts.northWest += 1;
					return "left";
				}
				else if (directionalCounts.northWest === 7) {
					notBackAtStart = true;
					directionalCounts.northWest += 1;
					return "down";
				}
			}
			else {
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				placementPosition -= 1;
				if (stairsDone.thirdStairDone) {
					notBackAtStart = true;
					placementPosition = 6;
				}
				if (stairsDone.fourthStairDonePrecursor) {
					stairsDone.fourthStairDone = true
				}
				directionalCounts.northWest = 0;
				return "left";
			}
		}
		else if (placementPosition === 4) {
			if (notBackAtStart) {
				if (directionalCounts.right === 0) {
					directionalCounts.right += 1
					return "right";
				}
				else if (directionalCounts.right === 1) {
					directionalCounts.right += 1;
					return "up";
				}
				else if (directionalCounts.right === 2) {
					directionalCounts.right += 1;
					return "right";
				}
				else if (directionalCounts.right === 3) {
					directionalCounts.right += 1;
					return "right";
				}
				else if (directionalCounts.right === 4) {
					directionalCounts.right += 1;
					return "down";
				}
				else if (directionalCounts.right === 5) {
					directionalCounts.right += 1;
					return "drop";
				}
				else if (directionalCounts.right === 6) {
					directionalCounts.right += 1;
					if (cell.level === 5) {
						stairsDone.fifthStairDonePrecursor = true;
					}
					return "up";
				}
				else if (directionalCounts.right === 7) {
					directionalCounts.right += 1;
					return "left";
				}
				else if (directionalCounts.right === 8) {
					directionalCounts.right += 1;
					return "left";
				}
				else if (directionalCounts.right === 9) {
					notBackAtStart = false;
					directionalCounts.right += 1;
					return "down";
				}
			}
			else {
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				placementPosition -= 1;
				if (stairsDone.fourthStairDone) {
					notBackAtStart = true;
					placementPosition = 6;
				}
				if (stairsDone.fifthStairDonePrecursor) {
					stairsDone.fifthStairDone = true;
				}
				directionalCounts.right = 0;
				return "left";
			}
		}
		else if (placementPosition === 5) {
			if (!notBackAtStart) {
				if (directionalCounts.southWest === 0) {
					directionalCounts.southWest += 1
					return "right";
				}
				else if (directionalCounts.southWest === 1) {
					directionalCounts.southWest += 1;
					return "up";
				}
				else if (directionalCounts.southWest === 2) {
					directionalCounts.southWest += 1;
					return "right";
				}
				else if (directionalCounts.southWest === 3) {
					directionalCounts.southWest += 1;
					return "right";
				}
				else if (directionalCounts.southWest === 4) {
					directionalCounts.southWest += 1;
					return "down";
				}
				else if (directionalCounts.southWest === 5) {
					directionalCounts.southWest += 1;
					return "down";
				}
				else if (directionalCounts.southWest === 6) {
					directionalCounts.southWest += 1;
					return "drop";
				}
				else if (directionalCounts.southWest === 7) {
					directionalCounts.southWest += 1;
					if (cell.level === 6) {
						stairsDone.sixthStairDonePrecursor = true;
					}
					return "up";
				}
				else if (directionalCounts.southWest === 8) {
					directionalCounts.southWest += 1;
					return "up";
				}
				else if (directionalCounts.southWest === 9) {
					directionalCounts.southWest += 1;
					return "left";
				}
				else if (directionalCounts.southWest === 10) {
					directionalCounts.southWest += 1;
					return "left";
				}
				else if (directionalCounts.southWest === 11) {
					notBackAtStart = true;
					directionalCounts.southWest += 1;
					return "down";
				}
			}
			else {
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				placementPosition -= 1;
				if (stairsDone.fifthStairDone) {
					notBackAtStart = true;
					placementPosition = 6;
				}
				if (stairsDone.sixthStairDonePrecursor) {
					stairsDone.sixthStairDone = true;
				}
				directionalCounts.southWest = 0;
				return "left";
			}
		}
		else if (placementPosition === 6) {
			if (notBackAtStart) {
				if (directionalCounts.down === 0) {
					directionalCounts.down += 1
					return "right";
				}
				else if (directionalCounts.down === 1) {
					directionalCounts.down += 1;
					return "up";
				}
				else if (directionalCounts.down === 2) {
					directionalCounts.down += 1;
					return "right";
				}
				else if (directionalCounts.down === 3) {
					directionalCounts.down += 1;
					return "right";
				}
				else if (directionalCounts.down === 4) {
					directionalCounts.down += 1;
					return "down";
				}
				else if (directionalCounts.down === 5) {
					directionalCounts.down += 1;
					return "down";
				}
				else if (directionalCounts.down === 6) {
					directionalCounts.down += 1;
					return "left";
				}
				else if (directionalCounts.down ===  7) {
					directionalCounts.down += 1;
					return "drop";
				}
				else if (directionalCounts.down === 8) {
					directionalCounts.down += 1;
					if (cell.level === 7) {
						stairsDone.seventhStairDonePrecursor = true;
						return "up";
					}
					return "right";
				}
				else if (directionalCounts.down === 9) {
					directionalCounts.down += 1;
					return "up";
				}
				else if (directionalCounts.down === 10) {
					directionalCounts.down += 1;
					return "up";
				}
				else if (directionalCounts.down === 11) {
					directionalCounts.down += 1;
					return "left";
				}
				else if (directionalCounts.down === 12) {
					directionalCounts.down += 1;
					return "left";
				}
				else if (directionalCounts.down === 13) {
					notBackAtStart = false;
					directionalCounts.down += 1;
					return "down";
				}
			}
			else {
				blockPoint += 1;
				toBlockPathPoint = 0;
				fromBlockPathPoint = 0;
				blockNotPickedUp = true;
				placementPosition -= 1;
				if (stairsDone.sixthStairDone) {
					notBackAtStart = true;
					placementPosition = 6;
				}
				if (stairsDone.seventhStairDonePrecursor) {
					stairsDone.seventhStairDone = true;
				}
				directionalCounts.down = 0;
				return "left";
			}
		}
	}
}