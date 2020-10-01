export class TerrainCalculation {
    constructor(playerData) {
        this.playerData = playerData;
    }

    registerSquareCalculation() {
        // Distance calculation
        const oldSquareDist = SquareGrid.prototype.measureDistances;
        const {playerData} = this;
        const self = this;
        SquareGrid.prototype.measureDistances = this.calculateDistance(oldSquareDist, self, playerData);
        return this;
    }

    registerHexCalculation() {
        // Distance calculation
        const oldHexDist = HexagonalGrid.prototype.measureDistances;
        const {playerData} = this;
        const self = this;
        HexagonalGrid.prototype.measureDistances = this.calculateDistance(oldHexDist, self, playerData);
        return this;
    }

    calculateDistance(oldMeasureFunction, self, playerData) {
        return function (segments, options = {}) {
            const res = oldMeasureFunction.apply(this, arguments);
            if (segments.length === 0)
                return res;
            let currentWaypoints = [];
            let currentMultiplier;
            let data = self.getCurrentTerrainData(segments);
            currentWaypoints = data[0];
            currentMultiplier = data[1];

            if (currentWaypoints == null) {
                currentWaypoints = playerData.difficultWaypoints;
                currentMultiplier = playerData.currentDifficultyMultiplier;
            }
            if (currentWaypoints == null || isNaN(currentMultiplier))
                return res;
            return res.map((s, i) => {
                if (currentWaypoints.length > i)
                    return s * currentWaypoints[i];
                return s * currentMultiplier;

            });
        };
    }

    getCurrentTerrainData(segments) {
        for (const [key, value] of this.playerData.otherPlayerWaypoints.entries()) {
            if (value.wayPoints === null || value.wayPoints === undefined || value.endPoint === null || value.endPoint === undefined)
                continue;
            if (value.wayPoints.length < segments.length || value.wayPoints.length - 1 > segments.length)
                continue;

            if (!(value.wayPoints[0].x === segments[0].ray.A.x && value.wayPoints[0].y === segments[0].ray.A.y
              && value.endPoint.x === segments[segments.length - 1].ray.B.x && value.endPoint.y === segments[segments.length - 1].ray.B.y))
                continue;
            let matches = true;
            for (let i = 1; i < segments.length - 1; i++)
                if (!(value.wayPoints[i].x === segments[i].ray.A.x && value.wayPoints[i].y === segments[i].ray.A.y)) {
                    matches = false;
                    break;
                }

            if (!matches)
                continue;

            this.playerData.otherPlayerWaypoints.delete(key);

            return [value.difficultyMultiplierWayPoints, value.difficultMultiplierNow];
        }
        return [null, 1];
    }

    // Following code is from Will Sanders module https://github.com/wsaunders1014/EnhancedMovement/blob/master/enhanced-movement.js

    static calcStraightLine(startCoordinates, endCoordinates) {
        const coordinatesArray = [];
        // Translate coordinates
        let [x1, y1] = startCoordinates
        let [x2, y2] = endCoordinates
        // Define differences and error check
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        let sx, sy;
        if (canvas.scene.data.gridType === 0) {
            sx = (x1 < x2) ? 10 : -10;
            sy = (y1 < y2) ? 10 : -10;
        } else {
            sx = (x1 < x2) ? 1 : -1;
            sy = (y1 < y2) ? 1 : -1;
        }
        let err = dx - dy;
        // Set first coordinates
        //coordinatesArray.push([x1, y1]);
        // Main loop
        while (!((x1 === x2) && (y1 === y2))) {
            const e2 = err << 1;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
            // Set coordinates
            coordinatesArray.push([x1, y1]);
        }
        // Return the result
        return coordinatesArray;
    }

    static checkForTerrain(x, y) {
        if (canvas.terrain.costGrid[x] == null) return false
        if (canvas.terrain.costGrid[x][y] == null) return false

        return canvas.terrain.costGrid[x][y];
    }
}

