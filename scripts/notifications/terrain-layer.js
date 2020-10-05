export function informTerrainLayerIntegration(ModuleID) {
    let extraText = ''
    if(game.user.isGM)
        extraText ='<p>With this update Difficult Terrain got <a href="https://github.com/wsaunders1014/TerrainLayer">Terrain Layer</a> compatibility!</p><h3>Information for the DM</h3><p>As DM you have to install the Terrain Layer module and enable the compatibility in the Difficult Terrain module settings, <strong>reload required</strong>!</p> <p>Your Players will only see the following guide as notification when enabling this feature</p>' +
          '<h4>Having Issues?</h4> <p>Creat an Issue on my <a href="https://github.com/Nordiii/difficultterrain/issues">Github</a> or tag me in the FoundryVTT Discord (Nordiii)! </p>'
    if ((game.user.isGM || game.settings.get(ModuleID, "useTerrainLayer")) && !game.settings.get(ModuleID, "dontShowAgainTerrainLayer")) {
        let dialog = new Dialog({
            title: 'Difficult Terrain - Terrain Layer compatibility',
            content: `
${extraText}
<h3>Guide:</h3>
<p>With the Terrain Layer module enabled you need to set a waypoint before entering/exiting a field with different modifiers!</p>
<p style="color:green;">Correct:</p>
<img src="https://raw.githubusercontent.com/Nordiii/difficultterrain/master/media/correct.gif" alt="Error loading gif"> <br>

<p style="color:red;">Wrong:</p>
<img src="https://raw.githubusercontent.com/Nordiii/difficultterrain/master/media/wrong.gif" alt="Error loading gif"> <br><br>

<p style="color:green;">A correct full Path:</p>
<img src="https://raw.githubusercontent.com/Nordiii/difficultterrain/master/media/fullcorrectpath.gif" alt="Error loading gif"> <br>
`,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Ok',
                },
                dontShowAgain: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Dont show again',
                    callback: () => {
                        game.settings.set(ModuleID, "dontShowAgainTerrainLayer", true)
                    }
                }
            }
        });


        dialog.options.height = 700;
        dialog.position.height = 700;
        dialog.options.width = 700;
        dialog.position.width = 700;
        dialog.render(true)
    }
}