# Difficult Terrain
This module adds the functionality of difficult terrain to any ruler created!
Customizable hotkeys to increase/decrease the multiplier.

## Show Drag Distance
It seems like Difficult Terrain and Show Drag Distance currently **don't work together** (not sure if it's the FoundryVTT or SDD update).
I am thinking about better solutions to integrate modules which extend the ruler class.

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
* [HexagonalGrid] Ruler sometimes ignores the terrain layer marker
* [SquareGrid] Ruler sometimes ignores the terrain layer marker

Both issues happen because the path does not get calculated the same way how the highlighted ruler path is calculated.

## Changelog
#### 1.0.9
* update languages, thanks @drdwing and @mcelemente

#### 1.0.8
* fix issue when not using Terrain Layer module
* update compatibility for 0.7.5
* add option to add the multiplier to difficulty instead of multiplying

#### 1.0.7
* update minor spelling mistakes and issues with lang support

#### 1.0.6 
* improve Terrain Layer support for SquareGrid 

#### 1.0.5
* improve Terrain Layer support for HexGrids, this will make it a lot better

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