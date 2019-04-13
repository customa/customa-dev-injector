const { Plugin } = require("powercord/entities");
const { getModuleByDisplayName, React } = require("powercord/webpack");
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
    styleManager = powercord.pluginManager.get('pc-styleManager');

    styleManager.load(`Customa-Injector-Styles`, path.join(__dirname, 'style.css'));

    this.registerSettings(
      'devInjector',
      'Customa Dev Injector',
      () => React.createElement(Settings, { settings: this.settings })
    )

    this.loadFiles()
    this.loadFolder()

    this.log("Initial Load successful!")
  }

  async pluginWillUnload() {
    while (!styleManager.ready) {
      await sleep(1);
    }

    idStorage.forEach(id => {
      styleManager.unload(`Customa-Injector-File-${id}`);
    })

    styleManager.unload(`Customa-Injector-Styles`);

    idStorage = [];
    idCounter = 0;
  }

  async loadFiles(files = this.settings.get('files'), exceptions = this.settings.get('exceptions'), folder = '') {
    while (!styleManager.ready) {
      await sleep(1);
    }

    if (files == undefined) {
      files = [];
    }

    files.forEach(file => {
      if (folder != '' && folder.slice(-1)[0] != '\\') {
        file = folder + '\\' + file;
      } else {
        file = folder + file;
      }

      if (!exceptions.includes(file)) {
        if (fs.lstatSync(file).isFile()) {
          if (file.split('.').slice(-1)[0] == 'css') {
            let id = `${idCounter}-${file.split("\\").slice(-1)[0].split('.')[0]}`;
            idCounter++;
            idStorage.push(id);

            styleManager.load(`Customa-Injector-File-${id}`, file);
          }
        } else {
          this.loadFolder([file])
        }
      } else {
        this.log("Excluded File: " + file);
      }
    });
  }

  loadFolder(folders = this.settings.get('folders'), exceptions = this.settings.get('exceptions')) {
    folders.forEach(folder => {
      if (!exceptions.includes(folder)) {
        if (!fs.lstatSync(folder).isFile()) {
          this.loadFiles(fs.readdirSync(folder), undefined, folder)
        } else {
          this.loadFiles([folder])
        }
      } else {
        this.log("Excluded Folder: " + folder);
      }
    });
  }
};
