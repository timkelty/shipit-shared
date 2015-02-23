# shipit-shared

A set of tasks for [Shipit](https://github.com/shipitjs/shipit) used for symlinking persistent (un-sourced) files and directories on deploy.

Based on the concept of `linked_files`/`linked_dirs` from [Capistrano](http://capistranorb.com/documentation/getting-started/configuration/)

**Features:**

- Triggered on the `published` event from [shipit-deploy](https://github.com/shipitjs/shipit-deploy)
- All neccesary directories are always created for you, whether you are linking a file or a directory.
- Works via [shipit-cli](https://github.com/shipitjs/shipit) and [grunt-shipit](https://github.com/shipitjs/grunt-shipit)
- Optionally ignore specified tables

**Roadmap**

- Optionally copy example files, such as example config files

## Install

```
npm install shipit-shared
```

## Usage

### Example `shipitfile.js`

```js
module.exports = function (shipit) {
  require('shipit-deploy')(shipit);
  require('shipit-shared')(shipit);

  shipit.initConfig({
    default: {
      shared: {
        dirs: [
          'public/storage',
          'db',
        ],
        files: [
          'config/environment.yml',
          'config/database.yml',
        ],
      }
    }
  });
};
```

To trigger on the deploy `published` event, you can simply deploy:

```
shipit staging deploy
```

Or you can run the tasks separatly :

```
shipit staging shared
    shipit staging shared:create-dirs
    shipit staging shared:link
        shipit staging shared:link:dirs
        shipit staging shared:link:files
```

## Options `shipit.config.shared`

### `shared.dirs`

Type: `Array`

An array of directories to symlink to `current`.

### `shared.files`

Type: `Array`

An array of files to symlink to `current`.

### `shared.baseDir`

Type: `String`

Path where files will be symlinked from. Relative to `shipit.config.deployTo`. Default: `shared`

## License

MIT
