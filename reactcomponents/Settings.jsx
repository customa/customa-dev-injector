const { getModuleByDisplayName, React } = require('powercord/webpack');
const { Category } = require('powercord/components/settings');
const { Button } = require('powercord/components');
const Input = getModuleByDisplayName('TextInput');

module.exports = class Settings extends React.Component {
  constructor(props) {
    super(props);

    const get = props.settings.get.bind(props.settings);

    this.state = {
      filesCategoryOpened: false,
      foldersCategoryOpened: false,
      exceptionsCategoryOpened: true,
      files: get('files', []),
      folders: get('folders', []),
      exceptions: get('folders', [])
    }
  }

  render() {
    return (
      <div>
        <Category
          name='Files to Load'
          description='Single Files Plugin should grab, watch and reload'
          opened={this.state.filesCategoryOpened}
          onChange={() => this.setState({ filesCategoryOpened: !this.state.filesCategoryOpened })}>
          <div id="customa-injector-files">
            {this.generateInputs('files')}
          </div>
        </Category>
        <Category
          name='Folders to Load'
          description='Folders Plugin should recursively grab files in, watch and reload'
          opened={this.state.foldersCategoryOpened}
          onChange={() => this.setState({ foldersCategoryOpened: !this.state.foldersCategoryOpened })}>
          <div id='customa-injector-folders'>
            {this.generateInputs('folders')}
            <Category
              name='Exceptions'
              description='Set Exceptions for Folders and Files for the recursive watching'
              opened={this.state.exceptionsCategoryOpened}
              onChange={() => this.setState({ exceptionsCategoryOpened: !this.state.exceptionsCategoryOpened })}>
              <div id='customa-injector-exceptions'>
                {this.generateInputs('exceptions')}
              </div>
            </Category>
          </div>
        </Category>
        <Button
          className={"customa-injector-save"}
          disabled={!this.state.changes}
          onClick={() => { this.saving(); }}>Save</Button>
      </div>
    )
  }

  saving() {
    this._set('files', this.state.files.filter(e => e != ''));
    this._set('folders', this.state.folders.filter(e => e != ''));
    this._set('exceptions', this.state.exceptions.filter(e => e != ''));

    this.state.changes = false;
    powercord.pluginManager.remount('pc-customa-dev-injector')
  }

  generateInputs(toLoad) {
    let arrayToLoad = this.state[toLoad].filter(e => e != '').concat(['']);
    return (
      <div>
        {arrayToLoad.flatMap((loadedElement, index) => {
          return (
            <div key={loadedElement}>
              <Input
                className={`customa-injector-text-${toLoad}`}
                key={index}
                defaultValue={loadedElement}
                placeholder={toLoad.charAt(0).toUpperCase() + toLoad.slice(1)}
                onBlur={(e) => {
                  this.handleTextChange(toLoad, index, e.target.value);
                  this.setState({ changes: true })
                }} />
            </div>
          );
        })}
      </div>
    )
  }

  handleTextChange(type, index, value) {
    let array = this.state[type].slice();
    array[index] = value;
    this.setState({ [type]: array });
  }

  _set(key, value = !this.state[key], defaultValue) {
    if (!value && defaultValue) {
      value = defaultValue;
    }

    this.props.settings.set(key, value);
    this.setState({ [key]: value });
  }
};
