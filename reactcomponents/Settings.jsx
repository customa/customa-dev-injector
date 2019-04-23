const { getModuleByDisplayName, React } = require('powercord/webpack')
const { Category } = require('powercord/components/settings')
const { Button, AsyncComponent } = require('powercord/components')
const Input = AsyncComponent.from(getModuleByDisplayName('TextInput'))

module.exports = class Settings extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      filesCategoryOpened: false,
      foldersCategoryOpened: false,
      exceptionsCategoryOpened: false,
      files: props.getSetting('files', []),
      folders: props.getSetting('folders', []),
      exceptions: props.getSetting('exceptions', [])
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
          </div>
        </Category>
        <Category
          name='Exceptions'
          description='Set Exceptions for Folders and Files for the recursive watching'
          opened={this.state.exceptionsCategoryOpened}
          onChange={() => this.setState({ exceptionsCategoryOpened: !this.state.exceptionsCategoryOpened })}>
          <div id='customa-injector-exceptions'>
            {this.generateInputs('exceptions')}
          </div>
        </Category>
        <Button
          className={"customa-injector-save"}
          disabled={!this.state.changes}
          onClick={() => { this.saving() }}>Save</Button>
      </div>
    )
  }

  componentWillUnmount() {
    ['files', 'folders', 'exceptions'].forEach(type => {
      let array = this.state[type];
      array.forEach((item, index) => {
        item.key = index;
      });
      this._set(type, array);
    })
  }

  saving() {
    this._set('files', this.state.files)
    this._set('folders', this.state.folders)
    this._set('exceptions', this.state.exceptions)
    this.props.saveHandler()
  }

  generateInputs(toLoad) {
    let is = [...this.state[toLoad]]
    if (is.length === 0) {
      is.push({ key: 0, value: '' })
    }

    const dis = is.map((n, i) => (
      <div key={n.key}>
        <Input
          defaultValue={n.value}
          onBlur={e => {
            let a = is

            if (e.target.value === "") {
              a.splice(i, 1)
              if (a.length === 0) {
                return
              }
            } else {
              a[i].value = e.target.value;
            }

            if (a[a.length - 1].value !== "") {
              a.push({
                key: a[a.length - 1].key + 1,
                value: ""
              })
            }

            this.setState({ [toLoad]: a })
            this.state.changes = true
          }}
          placeholder={toLoad.charAt(0).toUpperCase() + toLoad.slice(1)}
          className={`customa-injector-text-${toLoad}`}
        />
      </div>
    ))

    return <div>{dis}</div>
  }

  _set(key, value = !this.state[key], defaultValue) {
    if (!value && defaultValue) {
      value = defaultValue
    }

    this.props.updateSetting(key, value)
    this.setState({ [key]: value })
  }
}
