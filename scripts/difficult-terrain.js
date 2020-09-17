import {patch_ruler} from "./patch-ruler.js";

Hooks.once("ready", () => patch_ruler())

Hooks.once('init', () => {
    game.settings.register('difficultterrain', "maxTerrainMultiplier", {
        name: "difficultterrain.maxTerrainMultiplier.n",
        hint: "difficultterrain.maxTerrainMultiplier.h",
        scope: "world",
        config: true,
        default: 2,
        type: Number
    });
    game.settings.register('difficultterrain', "terrainMultiplierSteps", {
        name: "difficultterrain.terrainMultiplierSteps.n",
        hint: "difficultterrain.terrainMultiplierSteps.h",
        scope: "world",
        config: true,
        default: 1,
        type: Number
    });
    game.settings.register('difficultterrain', "incrementSpeed", {
        name: "difficultterrain.incrementSpeed.n",
        hint: "difficultterrain.incrementSpeed.h",
        scope: "client",
        config: true,
        default: 200,
        type: Number
    });
    game.settings.register('difficultterrain', "incrementHotkey", {
        name: "difficultterrain.incrementHotkey.n",
        hint: "difficultterrain.incrementHotkey.h",
        scope: "client",
        config: true,
        default: "x",
        type: String
    });
    game.settings.register('difficultterrain', "decreaseHotkey", {
        name: "difficultterrain.decreaseHotkey.n",
        hint: "difficultterrain.decreaseHotkey.h",
        scope: "client",
        config: true,
        default: "y",
        type: String
    });
});