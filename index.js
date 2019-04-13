const { Plugin } = require("powercord/entities");
const { React } = require("powercord/webpack");
const { sleep } = require('powercord/util');
const fs = require('fs');
const path = require('path')

let styleManager;
let idStorage = [];
let idCounter = 0;

const { inject, uninject } = require("powercord/injector");
const Settings = require('./reactcomponents/Settings');

module.exports = class DevInjector extends Plugin {
  async startPlugin() {
    // Get Style Manager due to repeated usage
    styleManager = powercord.pluginManager.get('pc-styleManager');

    // Load Internal Styling
    styleManager.load(`Customa-Injector-Styles`, path.join(__dirname, 'style.css'));

    // Register Settings Menu
    this.registerSettings(
      'devInjector',
      'Customa Dev Injector',
      () => React.createElement(Settings, { settings: this.settings })
    )

    // Wait until the StyleManager is Ready
    while (!styleManager.ready) {
      await sleep(1);
    }

    // Load Files and Folders with Default Parameters
    this.loadFiles()
    this.loadFolder()
  }

  async pluginWillUnload() {
    // Go through all the saved IDs and delete all styles associated with the plugin
    idStorage.forEach(id => {
      styleManager.unload(`Customa-Injector-File-${id}`);
    })

    // Delete Internal Styling
    styleManager.unload(`Customa-Injector-Styles`);

    // Clear ID Storage and reset the counter
    idStorage = [];
    idCounter = 0;
  }

  async loadFiles(files = this.settings.get('files'), exceptions = this.settings.get('exceptions'), folder = '') {
    // When nothing is set in settings this field can be undefined, to not break the loop below, it will be set to an empty array
    if (files == undefined) {
      files = [];
    }
    if (exceptions == undefined) {
      exceptions = [];
    }

    // Loop through all the files
    files.forEach(file => {

      // Is "folder" not empty or does it already end with a \
      if (folder != '' && folder.slice(-1)[0] != '\\') {
        file = folder + '\\' + file;
      } else {
        file = folder + file;
      }

      // If File is exceptions ignore it
      if (!exceptions.includes(file)) {
        // Check if "File" is really a file
        if (fs.lstatSync(file).isFile()) {
          // Check if the file is a css file
          if (file.split('.').slice(-1)[0] == 'css') {
            // Create an ID (using the counter) and the filename (without filetype)
            let id = `${idCounter}-${file.split("\\").slice(-1)[0].split('.')[0]}`;
            idCounter++;

            // Push the new ID to the storage
            idStorage.push(id);

            // Load File
            styleManager.load(`Customa-Injector-File-${id}`, file);
          }
        } else {
          // In case nested loading is needed, the current "file" will be sent to the folder loading again
          this.loadFolder([file])
        }
      } else {
        this.log("Excluded File: " + file);
      }
    });
  }

  loadFolder(folders = this.settings.get('folders'), exceptions = this.settings.get('exceptions')) {
    // When nothing is set in settings this field can be undefined, to not break the loop below, it will be set to an empty array
    if (folders == undefined) {
      folders = [];
    }
    if (exceptions == undefined) {
      exceptions = [];
    }

    // Loop through all the folders
    folders.forEach(folder => {
      // Ignore the folder when it is in the exceptions
      if (!exceptions.includes(folder)) {
        // Check whether the "folder", is actually a folder
        if (!fs.lstatSync(folder).isFile()) {
          // Read all Files into loadFiles when it is a folder, use default exceptions but give current folder as parameter so file will be found
          this.loadFiles(fs.readdirSync(folder), undefined, folder)
        } else {
          // Send one element array to file Loading when "folder" is file
          this.loadFiles([folder])
        }
      } else {
        this.log("Excluded Folder: " + folder);
      }
    });
  }
};
