import {TerrainCalculation} from "./terrain-calculation.js";
import {ModuleSettings} from "./module-settings.js";
import {PlayerData} from "./player-data.js";
import {informTerrainLayerIntegration} from "./notifications/terrain-layer.js";


export function patch_ruler() {

    //Register settings
    const moduleSettings = new ModuleSettings();

    //Notifications
    informTerrainLayerIntegration(ModuleSettings.getModuleId());

    //Register events
    const playerData = new PlayerData(moduleSettings)
      .registerBroadcast()
      .registerKeyEvent()
      .registerReceiveBroadcast()
      .registerLeftClick()
      .registerRightClick()
      .registerRulerClear();

    if (game.modules.get("TerrainLayer")?.active && moduleSettings.useTerrainLayer)
        playerData.registerMouseMoveEvent();

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
          .registerRulerClear();

        if (game.modules.get("TerrainLayer")?.active && moduleSettings.useTerrainLayer)
            playerData.registerMouseMoveEvent();

        terrainCalculation
          .registerSquareCalculation();
    });
}