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
            if(playerData.moduleSettings.addDifficulty)
                return self.addDistance(res, currentWaypoints, currentMultiplier)
            return self.multiplyDistance(res, currentWaypoints, currentMultiplier)
        };
    }

    multiplyDistance(res, currentWaypoints, currentMultiplier) {
        return res.map((s, i) => {
            if (currentWaypoints.length > i)
                return s * currentWaypoints[i];
            return s * currentMultiplier;

        });
    }

    addDistance(res, currentWaypoints, currentMultiplier) {
        return res.map((s, i) => {
            if (currentWaypoints.length > i)
                return s + currentWaypoints[i];
            return s + currentMultiplier;
        });
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

    static calcStraightLine(startCoordinates, endCoordinates) {

        // Translate coordinates
        let [x1, y1] = startCoordinates
        let [x2, y2] = endCoordinates

        switch (canvas.scene.data.gridType) {
            case 0:
                return TerrainCalculation.squareGridLine(x1, x2, y1, y2)
            case 1:
                return TerrainCalculation.squareGridLine(x1, x2, y1, y2)
            default:
                return TerrainCalculation.hexGridLine(x1, x2, y1, y2)
        }
    }

    static checkForTerrain(x, y) {
        if (canvas.terrain.costGrid[x] == null) return false
        if (canvas.terrain.costGrid[x][y] == null) return false

        return canvas.terrain.costGrid[x][y];
    }

    static hexGridLine(x1, x2, y1, y2) {
        let startCube = TerrainCalculation._offsetToCube(x1, y1)

        let endCube = TerrainCalculation._offsetToCube(x2, y2)
        let n = TerrainCalculation._cubeDistance(startCube, endCube)// Math.floor(Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2)))

        return TerrainCalculation.calculatePoints(x1, x2, y1, y2, n)
    }

    static calculatePoints(x1, x2, y1, y2, n) {
        const coordinatesArray = [];
        let pixStart = canvas.grid.grid.getPixelsFromGridPosition(x1, y1);
        let pixEnd = canvas.grid.grid.getPixelsFromGridPosition(x2, y2);

        pixStart = canvas.grid.grid.getCenter(pixStart[0], pixStart[1])
        pixEnd = canvas.grid.grid.getCenter(pixEnd[0], pixEnd[1])

        for (let i = 1; i <= n; i += 1) {

            let X = TerrainCalculation.lerp(pixStart[0], pixEnd[0], (1.0 / n) * i);
            let Y = TerrainCalculation.lerp(pixStart[1], pixEnd[1], (1.0 / n) * i);

            let position = canvas.grid.grid.getGridPositionFromPixels(X, Y)

            coordinatesArray.push(position);
        }
        return coordinatesArray;
    }

    static lerp(start, end, amount) {
        return (1 - amount) * start + amount * end;
    };

    static squareGridLine(x1, x2, y1, y2) {
        // Define differences and error check
        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let n = Math.max(dx, dy)

        return TerrainCalculation.calculatePoints(x1, x2, y1, y2, n)
    }

    // Following methods are private methods copied from the API
    static _cubeDistance(a, b) {
        let diff = {q: a.q - b.q, r: a.r - b.r, s: a.s - b.s};
        return (Math.abs(diff.q) + Math.abs(diff.r) + Math.abs(diff.s)) / 2;
    }

    static _offsetToCube(row, col) {
        let offset = canvas.grid.grid.options.even ? 1 : -1;

        // Column orientation
        if (canvas.grid.grid.columns) {
            let q = col,
              r = row - (col + offset * (col & 1)) / 2,
              s = 0 - q - r;
            return {q: q, r: r, s: s}
        }

        // Row orientation
        else {
            let r = row,
              q = col - (row + offset * (row & 1)) / 2,
              s = 0 - q - r;
            return {q: q, r: r, s: s}
        }
    }

}

