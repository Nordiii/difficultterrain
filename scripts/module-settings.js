const ModuleId= "difficultterrain"
export class ModuleSettings {

    min;
    max;
    increment;
    interval;
    incrementHotkey;
    decreaseHotkey;
    extendedRuler;
    useTerrainLayer;
    addDifficulty;

    constructor() {
        let getCurrentSettings = () => {
            this.max = game.settings.get(ModuleId, "maxTerrainMultiplier");
            this.increment = game.settings.get(ModuleId, "terrainMultiplierSteps");
            this.interval = game.settings.get(ModuleId, "incrementSpeed");
            this.useWheel = game.settings.get(ModuleId, "mousewheelCycle");
            this.incrementHotkey = game.settings.get(ModuleId, "incrementHotkey");
            this.decreaseHotkey = game.settings.get(ModuleId, "decreaseHotkey");
            this.extendedRuler = game.settings.get(ModuleId, "extendedRuler");
            this.useTerrainLayer = game.settings.get(ModuleId, "useTerrainLayer");
            this.addDifficulty = game.settings.get(ModuleId, "addDifficulty");
            //Set min value to zero
            this.min = this.addDifficulty ? 0 : 1;
        }
        getCurrentSettings();
        Hooks.on("closeSettingsConfig", () => getCurrentSettings());
    }

    static getModuleId(){
        return ModuleId;
    }

    static registerSettings() {
        game.settings.register(ModuleId, "dontShowAgainTerrainLayer", {
            name: "Only Show on update",
            hint: "Only Show on update",
            scope: "client",
            config: false,
            default: false,
            type: Boolean
        });

        game.settings.register(ModuleId, "maxTerrainMultiplier", {
            name: ModuleId+".maxTerrainMultiplier.n",
            hint: ModuleId+".maxTerrainMultiplier.h",
            scope: "world",
            config: true,
            default: 2,
            type: Number
        });
        game.settings.register(ModuleId, "terrainMultiplierSteps", {
            name: ModuleId+".terrainMultiplierSteps.n",
            hint: ModuleId+".terrainMultiplierSteps.h",
            scope: "world",
            config: true,
            default: 1,
            type: Number
        });
        game.settings.register(ModuleId, "incrementSpeed", {
            name: ModuleId+".incrementSpeed.n",
            hint: ModuleId+".incrementSpeed.h",
            scope: "client",
            config: true,
            default: 200,
            type: Number
        });
        game.settings.register(ModuleId, "mousewheelCycle", {
            name: ModuleId+".mousewheelCycle.n",
            hint: ModuleId+".mousewheelCycle.h",
            scope: "client",
            config: true,
            default: false,
            type: Boolean
        });
        game.settings.register(ModuleId, "incrementHotkey", {
            name: ModuleId+".incrementHotkey.n",
            hint: ModuleId+".incrementHotkey.h",
            scope: "client",
            config: true,
            default: "+",
            type: String
        });
        game.settings.register(ModuleId, "decreaseHotkey", {
            name: ModuleId+".decreaseHotkey.n",
            hint: ModuleId+".decreaseHotkey.h",
            scope: "client",
            config: true,
            default: "-",
            type: String
        });
        game.settings.register(ModuleId, "extendedRuler", {
            name: ModuleId+".extendedRuler.n",
            hint: ModuleId+".extendedRuler.h",
            scope: "world",
            config: true,
            default: "DragRuler",
            type: String
        });
        game.settings.register(ModuleId, "useTerrainLayer", {
            name: ModuleId+".useTerrainLayer.n",
            hint: ModuleId+".useTerrainLayer.h",
            scope: "world",
            config: true,
            default: false,
            type: Boolean
        });
        game.settings.register(ModuleId, "addDifficulty", {
            name: ModuleId+".addDifficulty.n",
            hint: ModuleId+".addDifficulty.h",
            scope: "world",
            config: true,
            default: false,
            type: Boolean
        });
    }
}