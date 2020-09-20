export class TerrainCalculation {
    constructor(playerData) {
        this.playerData = playerData;
    }

    registerSquareCalculation() {
        const oldSquareDist = SquareGrid.prototype.measureDistances;
        const playerData = this.playerData;
        const self = this;
        SquareGrid.prototype.measureDistances = function (segments, options = {}) {
            if (segments.length === 0)
                return oldSquareDist.apply(this, arguments);

            let currentWaypoints = null;
            let currentMultiplier;
            let data = self.getCurrentTerrainData(segments);
            currentWaypoints = data[0];
            currentMultiplier = data[1];

            if (currentWaypoints === null) {
                currentWaypoints = playerData.difficultWaypoints;
                currentMultiplier = playerData.currentDifficultyMultiplier
            }
            if (currentWaypoints == null || isNaN(currentMultiplier))
                return oldSquareDist.apply(this, arguments);
            //Basically the original function just with difficult terrain factored in, this will probably break other modules using rulers
            const d = canvas.dimensions;
            return segments.map((s, i) => {
                let r = s.ray;
                let nx = Math.abs(Math.ceil(r.dx / d.size));
                let ny = Math.abs(Math.ceil(r.dy / d.size));

                // Determine the number of straight and diagonal moves
                let nd = Math.min(nx, ny);
                let ns = Math.abs(ny - nx);
                // Linear distance for all moves
                if (currentWaypoints.length > i)
                    return (nd + ns) * d.distance * currentWaypoints[i];
                return (nd + ns) * d.distance * currentMultiplier;
            });
        };
        return this;
    }

    registerHexCalculation() {
        /// Distance calculation
        const oldHexDist = HexagonalGrid.prototype.measureDistances;
        const playerData = this.playerData;
        const self = this;
        HexagonalGrid.prototype.measureDistances = function (segments, options = {}) {
            if (segments.length === 0)
                return oldHexDist.apply(this, arguments);
            let currentWaypoints = null;
            let currentMultiplier;
            let data = self.getCurrentTerrainData(segments);
            currentWaypoints = data[0];
            currentMultiplier = data[1];

            if (currentWaypoints === null) {
                currentWaypoints = playerData.difficultWaypoints;
                currentMultiplier = playerData.currentDifficultyMultiplier
            }
            if (currentWaypoints == null || isNaN(currentMultiplier))
                return oldHexDist.apply(this, arguments);

            return segments.map((s, i) => {
                let r = s.ray;
                let [r0, c0] = this.getGridPositionFromPixels(r.A.x, r.A.y);
                let [r1, c1] = this.getGridPositionFromPixels(r.B.x, r.B.y);

                // Use cube conversion to measure distance
                let hex0 = this._offsetToCube(r0, c0);
                let hex1 = this._offsetToCube(r1, c1);
                let distance = this._cubeDistance(hex0, hex1);
                if (currentWaypoints.length > i)
                    return distance * canvas.dimensions.distance * currentWaypoints[i];
                return distance * canvas.dimensions.distance * currentMultiplier;

            });
        };
        return this;
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
        return [null, 1]
    }
}