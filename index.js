const { Plugin } = require("powercord/entities")
const { React } = require("powercord/webpack")
const { sleep } = require('powercord/util')
const fs = require('fs')
const path = require('path')

let styleManager
let idStorage = []
let idCounter = 0
let loadedFiles = []

const { inject, uninject } = require("powercord/injector")
const Settings = require('./reactcomponents/Settings')

module.exports = class DevInjector extends Plugin {
  async startPlugin() {
    // Get Style Manager due to repeated usage
    styleManager = powercord.pluginManager.get('pc-styleManager')

    // Load Internal Styling
    styleManager.load(`Customa-Injector-Styles`, path.join(__dirname, 'style.css'))

    // Register Settings Menu
    this.registerSettings(
      'devInjector',
      'Customa Dev Injector',
      () => React.createElement(Settings, { settings: this.settings })
    )

    // Wait until the StyleManager is Ready
    while (!styleManager.ready) {
      await sleep(1)
    }

    // Load Files and Folders with Default Parameters
    this.loadFiles()
    this.loadFolder()
  }

  async pluginWillUnload() {
    // Go through all the saved IDs and delete all styles associated with the plugin
    idStorage.forEach(id => {
      styleManager.unload(`Customa-Injector-File-${id}`)
    })

    // Delete Internal Styling
    styleManager.unload(`Customa-Injector-Styles`)

    // Clear ID Storage, loaded Files and reset the counter
    idStorage = []
    idCounter = 0
    loadedFiles = []
  }

  async loadFiles(filenames = this.settings.get('files'), exceptions = this.settings.get('exceptions'), folder = '') {
    // When nothing is set in settings this field can be undefined, to not break the loop below, it will be set to an empty array
    if (filenames == undefined) {
      filenames = []
    }
    if (exceptions == undefined) {
      exceptions = []
    } else {
      // To be able to use .includes later in the code, all exceptions will be formed according to the filename
      exceptions = exceptions.map((exception) => {
        return exception = exception.value.replace(/\\/g, '/')
      })
    }


    // Loop through all the files
    filenames.filter(e => e.value != '').forEach(element => {
      // Gather Value from field
      let filename = element.value;

      // Is "folder" not empty or does it already end with a \
      if (folder != '' && (folder.slice(-1)[0] != '\\' || folder.slice(-1)[0] != '/')) {
        filename = folder + '/' + filename
      } else {
        filename = folder + filename
      }

      // "Clean" the filename in DOS systems
      let cleanFilename = filename.replace(/\\/g, '/')

      // If File is exceptions ignore it
      if (exceptions.includes(cleanFilename)) {
        this.log("Excluded File: " + filename)
      } else if (loadedFiles.includes(cleanFilename)) {
        this.log("Duplicate File: " + filename)
      } else {
        // Check if "File" is really a file
        if (fs.lstatSync(filename).isFile()) {
          // Check if the file is a css file
          if (filename.split('.').slice(-1)[0] == 'css') {
            // Create an ID (using the counter) and the filename (without filetype)

            filename = filename.replace(/\\/g, '/')

            let id = `${idCounter}-${filename.split("/").slice(-1)[0].split('.')[0]}`
            idCounter++

            // Push the new ID to the storage
            idStorage.push(id)

            // Filename added to loaded files for internal checking
            loadedFiles.push(filename)

            // Load File
            styleManager.load(`Customa-Injector-File-${id}`, filename)
          }
        } else {
          // In case nested loading is needed, the current "file" will be sent to the folder loading again
          this.loadFolder([{ key: 0, value: filename }])
        }
      }
    })
  }

  loadFolder(foldernames = this.settings.get('folders'), exceptions = this.settings.get('exceptions')) {
    // When nothing is set in settings this field can be undefined, to not break the loop below, it will be set to an empty array
    if (foldernames == undefined) {
      foldernames = []
    }
    if (exceptions == undefined) {
      exceptions = []
    } else {
      // To be able to use .includes later in the code, all exceptions will be formed according to the filename
      exceptions = exceptions.map((exception) => {
        return exception = exception.value.replace(/\\/g, '/')
      })
    }

    // Loop through all the folders
    foldernames.filter(e => e.value != '').forEach(element => {
      // Gather Value from field
      let foldername = element.value

      // "Clean" the filename in DOS systems
      foldername = foldername.replace(/\\/g, '/')

      // Ignore the folder when it is in the exceptions
      if (!exceptions.includes(foldername)) {
        // Check whether the "folder", is actually a folder
        if (!fs.lstatSync(foldername).isFile()) {

          // Read all Files into loadFiles when it is a folder, use default exceptions but give current folder as parameter so file will be found
          let fileNames = fs.readdirSync(foldername);

          // Prepare Array for call of loadFile
          let files = fileNames.map((file) => {
            return file = { key: 0, value: file }
          })
          this.loadFiles(files, undefined, foldername)
        } else {
          // Send one element array to file Loading when "folder" is file
          this.loadFiles({ key: 0, value: foldername })
        }
      } else {
        this.log("Excluded Folder: " + foldername)
      }
    })
  }
}
