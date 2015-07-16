# shipit-shared

[![Join the chat at https://gitter.im/timkelty/shipit-shared](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/timkelty/shipit-shared?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/timkelty/shipit-shared.svg)](https://travis-ci.org/timkelty/shipit-shared)

A set of tasks for [Shipit](https://github.com/shipitjs/shipit) used for symlinking persistent (un-sourced) files and directories on deploy.

Based on the concept of `linked_files`/`linked_dirs` from [Capistrano](http://capistranorb.com/documentation/getting-started/configuration/)

**Features:**

- By default, the `shared` task is triggered on the `updated` event from [shipit-deploy](https://github.com/shipitjs/shipit-deploy)
- All necessary directories are always created for you, whether you are linking a file or a directory.
- Optionally set permissions on files.
- Works via [shipit-cli](https://github.com/shipitjs/shipit) and [grunt-shipit](https://github.com/shipitjs/grunt-shipit)

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
        overwrite: true,
        dirs: [
          'public/storage',
          {
            path: 'db',
            overwrite: false,
            chmod: '-R 777',
          }
        ],
        files: [
          'config/environment.yml',
          {
            path: 'config/database.yml',
            overwrite: false,
            chmod: '755',
          }
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

Or you can run the tasks separately :

```
shipit staging shared
    shipit staging shared:create-dirs
    shipit staging shared:link
        shipit staging shared:link:dirs
        shipit staging shared:link:files
```

## Options `shipit.config.shared`

### `shared.dirs`, `shared.files`

Type: `Array`

An array of files/directories to symlink into `current`. String values inherit default settings, objects allow per-item configuration:

```
'public/storage'
{
  path: 'db',
  overwrite: true,
  chmod: '-R 777'
}
```

#### `path`

Type: `String`

Path to the shared file/directory (relative to `current`). 

#### `overwrite`

Type: `Boolean`

If the target of the symlink exists in `current`, remove it before creating symlink.

#### `chmod`

Type: `String`

Options passed to the `chmod` command for the given path. 

### `shared.basePath`

Type: `String`
Default: `path.join(shipit.config.deployTo, 'shared')`

The path where your shared files reside.

### `shared.overwrite`

Type: `Boolean`
Default: `false`

If `true`, the target of your symlink (in `current`), **will be removed (via rm -rf)** before creating the symlink. Under normal circumstances, this is fine, as files in `current` have come directly from a git checkout.

If `false` and the target of your symlink is a file or directory, and error is thrown and the task aborted.

The default setting of `false` is a safety precaution to prevent unintentionally losing data. See https://github.com/timkelty/shipit-shared/issues/17

### `shared.symlinkPath`

Type: `String`
Default: `shared.basePath`

The path that will serve as the source for your symlink. This is usually the same as `shared.basePath`, however it can be [necessary to set this in a `chroot` environment](https://github.com/timkelty/shipit-shared/issues/7).

### `shared.triggerEvent`
Type: `String`, `Boolean`
Default: `updated`

Trigger `shared` task on given event name.
Set to `false` to prevent task from listening to any events.
(note: Some part of shipit-shared *besides initConfig* needs to be run before it can listen for events)

## Events
- `shared`
  + `shared:prepare`
    + `shared:create-dirs`
      * Emit event `sharedDirsCreated`
    + `shared:set-permissions`
      * Emit event `sharedPermissionsSet`
  + `shared:link`
    + `shared:link-dirs`
      * Emit event `sharedFilesDirs`
    + `shared:link-files`
      * Emit event `sharedFilesLinked`
  + `shared:end`
    * Emit event `sharedEnd`

## License

MIT
