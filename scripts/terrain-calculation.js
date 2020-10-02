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

        // Translate coordinates
        let [x1, y1] = startCoordinates
        let [x2, y2] = endCoordinates
        // Define differences and error check
        const dx = x2 - x1;
        const dy = y2 - y1;
        let sx, sy;
        if (canvas.scene.data.gridType === 0) {
            sx = (x1 < x2) ? 10 : -10;
            sy = (y1 < y2) ? 10 : -10;
        } else {
            sx = (x1 < x2) ? 1 : -1;
            sy = (y1 < y2) ? 1 : -1;
        }
        let err = dx - dy;

        switch (canvas.scene.data.gridType) {
            default:
                return TerrainCalculation.oddHexRowLine(x1, x2, y1, y2)
            case 1:
                return TerrainCalculation.squareLine(x1, x2, y1, y2, dy, dx, sy, sx, err)
        }
    }

    static checkForTerrain(x, y) {
        if (canvas.terrain.costGrid[x] == null) return false
        if (canvas.terrain.costGrid[x][y] == null) return false

        return canvas.terrain.costGrid[x][y];
    }

    static oddHexRowLine(x1, x2, y1, y2) {
        let startCube = TerrainCalculation.toCube(x1, y1)
        let endCube = TerrainCalculation.toCube(x2, y2)
        let n = TerrainCalculation.cubeDistance(startCube, endCube)

        const coordinatesArray = [];
        for (let i = 0; i <= n; i += 1)
            coordinatesArray.push(TerrainCalculation.toHex(TerrainCalculation.cube_lerp(startCube, endCube, (1.0 / n) * i)))

        return coordinatesArray;
    }

    static cube_lerp(startPoint, endPoint, t) {
        // if (canvas.grid.grid.even)
        //     t = -t;
        let cube = {
            x: (TerrainCalculation.lerp(startPoint.x, endPoint.x, t)),
            y: (TerrainCalculation.lerp(startPoint.y, endPoint.y, t)),
            z: (TerrainCalculation.lerp(startPoint.z, endPoint.z, t)),
        }
        return cube
    }

    static toHex(cube) {
        let rx, ry, rz;
        console.log(cube)
        if (canvas.grid.grid.even && canvas.grid.grid.columns) {
            rx = Math.round(cube.x - 0.1)
            ry = Math.round(cube.y - 0.1)
            rz = Math.round(cube.z - 0.1)
        }else {
            rx = Math.round(cube.x)
            ry = Math.round(cube.y)
            rz = Math.round(cube.z)
        }


        var x_diff = Math.abs(rx - cube.x)
        var y_diff = Math.abs(ry - cube.y)
        var z_diff = Math.abs(rz - cube.z)

        if (x_diff > y_diff && x_diff > z_diff)
            rx = -ry - rz
        else if (y_diff > z_diff)
            ry = -rx - rz
        else
            rz = -rx - ry

        return [rz, rx]
    }

    static lerp(value1, value2, amount) {
        return (1 - amount) * value1 + amount * value2;
    };

    static squareLine(x1, x2, y1, y2, dy, dx, sy, sx, err) {
        const coordinatesArray = [];
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

        return coordinatesArray
    }

    static cubeDistance(a, b) {
        let diff = {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z};
        return (Math.abs(diff.x) + Math.abs(diff.y) + Math.abs(diff.z)) / 2;
    }

    static toCube(row, col) {
        return {x: col, z: row, y: 0 - row - col}
    }

    // static offsetToCube(row, col, even, columns) {
    //     let offset = even ? 1 : -1;
    //
    Column
    orientation
    // if (columns) {
    //     let q = col,
    //       r = row - (col + offset * (col & 1)) / 2,
    //       s = 0 - q - r;
    //     return {q: q, r: r, s: s}
    // }
    //
    Row
    orientation
    // else {
    //     let r = row,
    //       q = col - (row + offset * (row & 1)) / 2,
    //       s = 0 - q - r;
    //     return {q: q, r: r, s: s}
    // }
    // }
}

