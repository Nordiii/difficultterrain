import {patch_ruler} from "./patch-ruler.js";
import {ModuleSettings} from "./module-settings.js";

Hooks.once('init', ModuleSettings.registerSettings);

Hooks.once("canvasReady", () => patch_ruler())
