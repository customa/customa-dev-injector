# Customa CSS Injector
This is a development plugin for Powercord, used for the theme development of Customa.
## What does it do?
This plugin is for Powercord Theme developers. It lets you edit CSS live with your favorite text editor.
It lets you load files and folder, set exceptions for those
## Features
* Load Files or Folders
    * Define Exceptions for Folders or Files
* Easy Setup using the Settings Menu provided with Powercord
* Detects duplicate files and doesn't load them
* Unloads files on disabling
## How to use it?
1. Clone the repo into the plugins folder of Powercord using the following command:
```SH
git clone https://gitlab.com/Customa/pc-customa-dev-injector.git
```
2. a. Reload Discord<br>
b. Put the following command into the Discord dev console:
```JS
powercord.pluginManager.remount('pc-customa-dev-injector')
```
3. Go to the appropriate menu entry in Settings:<br>
![Menu Entry](docs/images/SettingsMenuEntry.png)
4. Open the category you need and define exceptions when needed
![Menu](docs/images/SettingsMenu.png)
5. Press Tab if you need more inputs
6. When you are done press Save

## Roadmap
* Make Settings work properly
* Add more Development Aids
* Add commands for easy injection
* Variable injection?

## Known Issues
* None, create a Gitlab Issue if you find any

## Thanks to
* [Kosshi](https://github.com/kosshishub) for the original idea
* Bowser65#0001 - for making me not lose faith in React and writing a solution on how to fix the Settings menu bug (and working on Powercord)
* aetheryx#0001 - for looking at my messy code and trying to find the issue (and working on Powercord)

Created by: [GhostlyDilemma](https://gitlab.com/GhostlyDilemma) @ [Customa](https://github.com/Customa)<br>
Original Idea: [Kosshi](https://github.com/kosshishub)