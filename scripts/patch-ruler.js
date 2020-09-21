class gameSettingsData {
    constructor(max, increment, interval, incrementHotkey, decreaseHotkey, extendedRuler) {
        this.max = max;
        this.incremt = increment;
        this.interval = interval;
        this.incrementHotkey = incrementHotkey;
        this.decreaseHotkey = decreaseHotkey;
        this.extendedRuler = extendedRuler;
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
    let rulerArray = []

    Hooks.on("canvasReady", () => updateRulerInstances())
    updateRulerInstances();

    function updateRulerInstances() {
        rulerArray = []
        rulerArray.push(canvas.controls.ruler)
        gameSettings.extendedRuler.split(",").forEach(value => {
            let lowerCaseStart = value.charAt(0).toLowerCase() + value.slice(1);
            if (!(canvas.controls[value] == null))
                rulerArray.push(canvas.controls[value])
            else if (!(canvas.controls[lowerCaseStart] == null))
                rulerArray.push(canvas.controls[lowerCaseStart])
        });
    }

    const dragRulerFound = rulerArray.some(value => value.constructor.name === "DragRuler")
    Hooks.on("closeSettingsConfig", () => gameSettings = updateSettings());

    const handleLeftClick = () => {
        if (rulerArray.every(value => value.waypoints.length === 0))
            return;


        if (rulerArray.some(value => value.waypoints.length > difficultWaypoints.length + 1))
            difficultWaypoints.push(currentDifficultyMultiplier);
    }

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
    //Using this because pixi right click wont register when dragging a token
    $('body').on('contextmenu', (e) => {
        if (e.target.id === "board")
            handleRightClick();
    })

    const oldKeyEvent = KeyboardManager.prototype.getKey;
    KeyboardManager.prototype.getKey = function (e) {
        let result = oldKeyEvent.apply(this, arguments);
        if (dragRulerFound && e.key === "x") {
            if (difficultWaypoints.length >= canvas.controls.dragRuler.waypoints.length && canvas.controls.dragRuler.waypoints.length > 0)
                difficultWaypoints.pop();
        }
        if (Date.now() - lastRegisteredKeyPress < gameSettings.interval)
            return result;
        lastRegisteredKeyPress = Date.now();


        if (e.key === gameSettings.incrementHotkey) {
            setTerrainMultiplier(gameSettings.incremt)
            updateRuler(e);
        }
        if (e.key === gameSettings.decreaseHotkey) {
            setTerrainMultiplier(-gameSettings.incremt)
            updateRuler(e);
        }

        return result
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

    Hooks.on("canvasReady", () => monkeyPatchRuler())
    monkeyPatchRuler();
/// Distance calculation
    const oldHexDist = HexagonalGrid.prototype.measureDistances;

    HexagonalGrid.prototype.measureDistances = function (segments, options = {}) {
        //DIFFICULT TERRAIN PATCH
        let data = getCurrentTerrainData(segments);
        let currentWaypoints = [];
        let currentMultiplier;
        currentWaypoints = data[0];
        currentMultiplier = data[1];
        let res = oldHexDist.apply(this, arguments);

        if (currentWaypoints == null) {
            currentWaypoints = difficultWaypoints;
            currentMultiplier = currentDifficultyMultiplier
        }
        if (currentWaypoints == null || isNaN(currentMultiplier))
            return res;
        return res.map((s, i) => {
            if (currentWaypoints.length > i)
                return s * currentWaypoints[i];
            return s * currentMultiplier;
        });
    };

    function monkeyPatchRuler() {
        difficultWaypoints = [];
        canvas.app.stage.removeListener('click', handleLeftClick);
        canvas.app.stage.addListener('click', handleLeftClick);
        const oldRulerUpdate = rulerArray.map(value => canvas.controls["update" + value.constructor.name]);
        oldRulerUpdate.forEach((value, index) => canvas.controls["update" + rulerArray[index].constructor.name] = function (user, ruler) {
            if (ruler == null)
                return value.apply(this, arguments);
            otherPlayerWaypoints.set(user.id, new detailedWaypointData(ruler.waypoints, ruler.destination, ruler.difficultWaypoints, ruler.currentDifficultyMultiplier));
            value.apply(this, arguments)
        });

        const oldRulerClear = rulerArray.map(value => value.clear);
        oldRulerClear.forEach((value, index) => {
            if (!value.toString().includes("//DIFFICULT TERRAIN PATCH"))
                rulerArray[index].clear = function () {
                    //DIFFICULT TERRAIN PATCH
                    difficultWaypoints = [];
                    value.apply(this, arguments);
                }
        });

        const oldSquareDist = SquareGrid.prototype.measureDistances;
        SquareGrid.prototype.measureDistances = function (segments, options = {}) {
            //DIFFICULT TERRAIN PATCH
            let currentWaypoints = [];
            let currentMultiplier;
            let data = getCurrentTerrainData(segments);
            currentWaypoints = data[0];
            currentMultiplier = data[1];
            let res = oldSquareDist.apply(this, arguments);

            if (currentWaypoints == null) {
                currentWaypoints = difficultWaypoints;
                currentMultiplier = currentDifficultyMultiplier
            }
            if (currentWaypoints == null || isNaN(currentMultiplier))
                return res

            return res.map((s, i) => {
                if (currentWaypoints.length > i)
                    return s * currentWaypoints[i];
                return s * currentMultiplier;
            });
        };
    }

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
        game.settings.get("difficultterrain", "extendedRuler"),
    );
}