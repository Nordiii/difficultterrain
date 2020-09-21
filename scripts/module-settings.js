export class ModuleSettings {
    max;
    increment;
    interval;
    incrementHotkey;
    decreaseHotkey;
    extendedRuler;


    constructor() {
        let getCurrentSettings = () => {
            this.max = game.settings.get("difficultterrain", "maxTerrainMultiplier");
            this.increment = game.settings.get("difficultterrain", "terrainMultiplierSteps");
            this.interval = game.settings.get("difficultterrain", "incrementSpeed");
            this.useWheel = game.settings.get("difficultterrain", "mousewheelCycle");
            this.incrementHotkey = game.settings.get("difficultterrain", "incrementHotkey");
            this.decreaseHotkey = game.settings.get("difficultterrain", "decreaseHotkey");
            this.extendedRuler = game.settings.get("difficultterrain", "extendedRuler");
        }
        getCurrentSettings();
        Hooks.on("closeSettingsConfig", () => getCurrentSettings());
    }


    static registerSettings() {
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
        game.settings.register('difficultterrain', "mousewheelCycle", {
            name: "difficultterrain.mousewheelCycle.n",
            hint: "difficultterrain.mousewheelCycle.h",
            scope: "client",
            config: true,
            default: false,
            type: Boolean
        });
        game.settings.register('difficultterrain', "incrementHotkey", {
            name: "difficultterrain.incrementHotkey.n",
            hint: "difficultterrain.incrementHotkey.h",
            scope: "client",
            config: true,
            default: "+",
            type: String
        });
        game.settings.register('difficultterrain', "decreaseHotkey", {
            name: "difficultterrain.decreaseHotkey.n",
            hint: "difficultterrain.decreaseHotkey.h",
            scope: "client",
            config: true,
            default: "-",
            type: String
        });
        game.settings.register('difficultterrain', "extendedRuler", {
            name: "difficultterrain.extendedRuler.n",
            hint: "difficultterrain.extendedRuler.h",
            scope: "world",
            config: true,
            default: "DragRuler",
            type: String
        });
    }
}