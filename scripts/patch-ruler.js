import {TerrainCalculation} from "./terrain-calculation.js";
import {ModuleSettings} from "./module-settings.js";
import {PlayerData} from "./player-data.js";


export function patch_ruler() {

    const moduleSettings = new ModuleSettings();
    const playerData = new PlayerData(moduleSettings)
        .registerBroadcast()
        .registerKeyEvent()
        .registerReceiveBroadcast()
        .registerLeftClick()
        .registerRightClick()
        .registerRulerClear();

    if (moduleSettings.useWheel)
        playerData.registerMouseWheel();

    const terrainCalculation = new TerrainCalculation(playerData)
        .registerHexCalculation()
        .registerSquareCalculation();

    //Those methods need to be re executed as these monkey patches are getting overwritten on Scene change
    Hooks.on("canvasReady", () => {
        playerData
            .updateRulerArray()
            .registerLeftClick()
            .registerRulerClear()
        terrainCalculation
            .registerSquareCalculation();
    });
}