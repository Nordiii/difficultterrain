# Difficult Terrain
This module adds the functionality of difficult terrain to any ruler created!
Customizable hotkeys to increase/decrease the multiplier.

This module is somewhat compatible with [Show-Drag-Distance](https://github.com/wsaunders1014/ShowDragDistance) **version 2.1.4**, there are a few bugs, but I am not sure if those are on my end.

Future releases of Show-Drag-Distance may breaks this compatibility, just remove "DragRuler" in this case (difficult terrain module settings). 

## Terrain Layer Support
Basic Terrain Layer support got added with 1.0.4! It is not perfect as you have to set waypoints before entering/exiting different terrain layers, else the first value will be calculated into the whole ruler!

A ruler path segment going over a terrain layer will enforce its multiplier on this segment, other parts can be adjusted with hotkeys

### Examples
##### Correct:
![Correct](https://raw.githubusercontent.com/Nordiii/difficultterrain/master/media/correct.gif)
##### Wrong:
![Wrong](https://raw.githubusercontent.com/Nordiii/difficultterrain/master/media/wrong.gif)
##### Full correct path:
![FullCorrectPath](https://raw.githubusercontent.com/Nordiii/difficultterrain/master/media/fullcorrectpath.gif)

## Settings
![Settings](https://raw.githubusercontent.com/Nordiii/difficultterrain/master/media/settings.JPG)
## Normal ruler showcase
![Normal ruler showcase](https://raw.githubusercontent.com/Nordiii/difficultterrain/master/media/difficultterrain.gif)
## Show-Drag-Distance showcase
![Show-Drag-Distance showcase](https://raw.githubusercontent.com/Nordiii/difficultterrain/master/media/difficultterrainshowdragdistance.gif)

## Known Issues
### Major
(With Terrain Layer compatibility enabled)
* Hex fields can get wacky, most of the times it works but sometimes the terrain layer marker will be ignored
### Minor
(With Terrain Layer compatibility enabled)
* Starting a new Ruler after ending a ruler will often display (for other players) the ruler going to the last endpoint until the mouse gets moved a little more

## Changelog

#### 1.0.4
* add basic support for Terrain Layer

#### 1.0.3
* fix difficult terrain breaking when user directly clicks twice on the same square
 
#### 1.0.2
* Refactoring 
* Add option to enable mouse wheel as option to cycle through difficulties

#### 1.0.1
* Fixed issue with scene changes (possible only when scene changes grid type) breaking this module  
* Fixed issue with alternative movement rules

    This change should also greatly boost the compatibility with other game systems!

#### 1.0.0
* initial release