class gameSettingsData {
    constructor(max, increment, interval, incrementHotkey, decreaseHotkey) {
        this.max = max;
        this.incremt = increment;
        this.interval = interval;
        this.incrementHotkey = incrementHotkey;
        this.decreaseHotkey = decreaseHotkey;
    }
}

class detailedWaypointData {
    constructor(wayPoints, endPoint, difficultyMultiplierWayPoints, difficultMultiplierNow) {
        this.wayPoints = wayPoints;
        this.endPoint = endPoint;
        this.difficultyMultiplierWayPoints = difficultyMultiplierWayPoints;
        this.difficultMultiplierNow = difficultMultiplierNow;
    }
}

export function patch_ruler() {
    let difficultWaypoints = [];
    let otherPlayerWaypoints = new Map();
    let currentDifficultyMultiplier = 1;
    let gameSettings = updateSettings();
    let lastRegisteredKeyPress = Date.now();
    const rulerArray = [canvas.controls.ruler]
    if (canvas.controls.dragRuler !== undefined)
        rulerArray.push(canvas.controls.dragRuler)

    Hooks.on("closeSettingsConfig", () => gameSettings = updateSettings());

    const handleLeftClick = () => {
        if (rulerArray.every(value => value.waypoints.length === 0))
            return;

        if (rulerArray.some(value => value.waypoints.length > difficultWaypoints.length + 1))
            difficultWaypoints.push(currentDifficultyMultiplier);
    }
    canvas.app.stage.addListener('click', handleLeftClick);
    const handleRightClick = () => {
        if (rulerArray.every(value => value.waypoints.length === 0))
            return;
        if (rulerArray.some(value => value.constructor.name === "DragRuler"))
            if (rulerArray.some(value => value.waypoints.length > difficultWaypoints.length + 1)) {

                difficultWaypoints.push(currentDifficultyMultiplier);
                return;
            }

        difficultWaypoints.pop();
    }
    $('body').on('contextmenu', (e) => {
        if (e.target.id === "board")
            handleRightClick();
    })

    const oldKeyEvent = KeyboardManager.prototype.getKey;
    KeyboardManager.prototype.getKey = function (e) {
        if (Date.now() - lastRegisteredKeyPress < gameSettings.interval)
            return oldKeyEvent.apply(this, arguments);
        lastRegisteredKeyPress = Date.now();

        if (e.key === gameSettings.incrementHotkey) {
            setTerrainMultiplier(gameSettings.incremt)
            updateRuler(e);
        }
        if (e.key === gameSettings.decreaseHotkey) {
            setTerrainMultiplier(-gameSettings.incremt)
            updateRuler(e);
        }

        return oldKeyEvent.apply(this, arguments);
    };

    function setTerrainMultiplier(amount) {
        if (currentDifficultyMultiplier === gameSettings.max && amount > 0)
            currentDifficultyMultiplier = 1
        else if (currentDifficultyMultiplier === 1 && amount < 0)
            currentDifficultyMultiplier = gameSettings.max
        else
            currentDifficultyMultiplier = Math.clamped(currentDifficultyMultiplier + amount, 1, gameSettings.max);
    }

    const oldBroadcast = game.user.broadcastActivity;
    game.user.broadcastActivity = function (activityData) {
        if (activityData.ruler == null && activityData.dragruler == null)
            return oldBroadcast.apply(this, arguments);


        if (activityData.ruler != null)
            activityData.ruler = Object.assign({
                difficultWaypoints: difficultWaypoints,
                currentDifficultyMultiplier: currentDifficultyMultiplier
            }, activityData.ruler);
        else
            activityData.dragruler = Object.assign({
                difficultWaypoints: difficultWaypoints,
                currentDifficultyMultiplier: currentDifficultyMultiplier
            }, activityData.dragruler);
        oldBroadcast.apply(this, arguments);
    };

    const oldRulerUpdate = rulerArray.map(value => canvas.controls["update" + value.constructor.name]);
    oldRulerUpdate.forEach((value, index) => canvas.controls["update" + rulerArray[index].constructor.name] = function (user, ruler) {
        if (ruler == null)
            return value.apply(this, arguments);
        otherPlayerWaypoints.set(user.id, new detailedWaypointData(ruler.waypoints, ruler.destination, ruler.difficultWaypoints, ruler.currentDifficultyMultiplier));
        value.apply(this, arguments)
    });

    /// Distance calculation
    const oldHexDist = HexagonalGrid.prototype.measureDistances;
    HexagonalGrid.prototype.measureDistances = function (segments, options = {}) {
        if (segments.length === 0)
            return oldHexDist.apply(this, arguments);
        let currentWaypoints = null;
        let currentMultiplier;
        let data = getCurrentTerrainData(segments);
        currentWaypoints = data[0];
        currentMultiplier = data[1];

        if (currentWaypoints === null) {
            currentWaypoints = difficultWaypoints;
            currentMultiplier = currentDifficultyMultiplier
        }
        if (currentWaypoints === undefined || currentWaypoints === null)
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

    const oldSquareDist = SquareGrid.prototype.measureDistances;
    SquareGrid.prototype.measureDistances = function (segments, options = {}) {
        if (segments.length === 0)
            return oldSquareDist.apply(this, arguments);

        let currentWaypoints = null;
        let currentMultiplier;
        let data = getCurrentTerrainData(segments);
        currentWaypoints = data[0];
        currentMultiplier = data[1];

        if (currentWaypoints === null) {
            currentWaypoints = difficultWaypoints;
            currentMultiplier = currentDifficultyMultiplier
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

    function getCurrentTerrainData(segments) {
        for (const [key, value] of otherPlayerWaypoints.entries()) {
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

            otherPlayerWaypoints.delete(key);

            return [value.difficultyMultiplierWayPoints, value.difficultMultiplierNow];
        }
        return [null, 1]
    }

    function updateRuler(e) {
        if (rulerArray.every(value => value.waypoints.length === 0))
            return;
        let currentRuler = rulerArray.find(value => value.waypoints.length > 0)
        let newEvent = {};
        newEvent.data = {
            origin: currentRuler.waypoints[currentRuler.waypoints.length - 1],
            destination: currentRuler.destination,
            originalEvent: e
        };

        let ruler = {
            class: currentRuler.constructor.name,
            name: currentRuler.constructor.name + "." + game.user.id,
            waypoints: currentRuler.waypoints,
            destination: currentRuler.destination,
            speed: currentRuler.tokenSpeed,
            _state: 2
        };
        let activityData = {
            // cursor: canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(canvas.app.stage),
            [ruler.class.toLowerCase()]: ruler
        };
        if (game.user.hasPermission("SHOW_RULER"))
            game.user.broadcastActivity(activityData);
        currentRuler._onMouseMove(newEvent);
    }
}


function updateSettings() {
    return new gameSettingsData(
        game.settings.get("difficultterrain", "maxTerrainMultiplier"),
        game.settings.get("difficultterrain", "terrainMultiplierSteps"),
        game.settings.get("difficultterrain", "incrementSpeed"),
        game.settings.get("difficultterrain", "incrementHotkey"),
        game.settings.get("difficultterrain", "decreaseHotkey"),
    );
}