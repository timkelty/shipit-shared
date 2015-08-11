var utils = require('shipit-utils');
var sprintf = require('sprintf-js').sprintf;
var path = require('path2/posix');
var chalk = require('chalk');
var Promise = require('bluebird');
var init = require('../../lib/init');
var _ = require('lodash');

/**
 * Create shared symlinks.
 */

module.exports = function(gruntOrShipit) {
  var link = function link(item) {
    var shipit = utils.getShipit(gruntOrShipit);

    return init(shipit).then(function(shipit) {
      var source = path.join(shipit.config.shared.symlinkPath, item.path);
      var target = path.join(shipit.releasesPath, shipit.releaseDirname, item.path);
      var check = function() {
        var cmd = sprintf('if ( [ -e "%(target)s" ] && ! [ -h "%(target)s" ] ); then echo false; fi', {
          target: target
        });

        return shipit.remote(cmd).then(function(response) {
          response.forEach(function(elem) {
            if (elem.stdout.trim() === 'false') {
              throw new Error(sprintf('Cannot create shared symlink, file exists at "%(target)s". See https://github.com/timkelty/shipit-shared/#sharedoverwrite for more information.', {
                target: target
              }));
            }
          });
        })
      };

      return Promise.resolve(item.overwrite ? item.overwrite : check())
      .then(function() {
        var cmd = sprintf('if ( ! [ -e "%(source)s" ] ); then cp "%(target)s" "%(source)s"; fi', {
          source: source,
          target: target
        });

        return shipit.remote(cmd);
      })
      .then(function() {
        var cmd = sprintf('if ( ! [ -h "%(target)s" ] ); then rm -rf "%(target)s" 2> /dev/null; ln -s "%(source)s" "%(target)s"; fi', {
          source: source,
          target: target
        });

        return shipit.remote(cmd);
      })
      .catch(function(e) {
        console.log(chalk.bold.red('\nError: ' + e.message));
        process.exit();
      });
    });
  }

  var linkDirs = function linkDirs() {
    var shipit = utils.getShipit(gruntOrShipit);

    return init(shipit).then(function(shipit) {
      if (!shipit.config.shared.dirs.length) {
        return Promise.resolve();
      }

      var promises = shipit.config.shared.dirs.map(function(item) {
        return link(item);
      });

      return new Promise.all(promises)
      .then(function() {
        shipit.log(chalk.green('Shared directories symlinked on remote.'));
        shipit.emit('sharedDirsLinked');
      });
    });
  }

  var linkFiles = function linkFiles() {
    var shipit = utils.getShipit(gruntOrShipit);

    return init(shipit).then(function(shipit) {
      if (!shipit.config.shared.files.length) {
        return Promise.resolve();
      }

      var promises = shipit.config.shared.files.map(function(item) {
        return link(item);
      });

      return new Promise.all(promises)
      .then(function() {
        shipit.log(chalk.green('Shared files symlinked on remote.'));
        shipit.emit('sharedFilesLinked');
      });
    });
  }

  utils.registerTask(gruntOrShipit, 'shared:link:dirs', linkDirs);
  utils.registerTask(gruntOrShipit, 'shared:link:files', linkFiles);
  utils.registerTask(gruntOrShipit, 'shared:link', [
    'shared:link:dirs',
    'shared:link:files'
  ]);
};
