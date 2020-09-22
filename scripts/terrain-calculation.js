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
}