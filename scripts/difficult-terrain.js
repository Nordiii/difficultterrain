import {patch_ruler} from "./patch-ruler.js";
import {ModuleSettings} from "./module-settings.js";

Hooks.once("ready", () => patch_ruler())

Hooks.once('init', ModuleSettings.registerSettings);