var utils = require('shipit-utils');
var sprintf = require('sprintf-js').sprintf;
var path = require('path2/posix');
var chalk = require('chalk');
var Bluebird = require('bluebird');
var init = require('../../lib/init');
var _ = require('lodash');

/**
 * Create shared symlinks.
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'shared:link:dirs', linkDirs);
  utils.registerTask(gruntOrShipit, 'shared:link:files', linkFiles);
  utils.registerTask(gruntOrShipit, 'shared:link', [
    'shared:link:dirs',
    'shared:link:files'
  ]);

  function link(file) {
    var shipit = utils.getShipit(gruntOrShipit);

    return init(shipit).then(function(shipit) {

      var source = path.join(shipit.sharedSymlinkPath, file.path);
      var target = path.join(shipit.releasesPath, shipit.releaseDirname, file.path);
      var check = function() {
        var cmd = sprintf('if ( [ -e "%(target)s" ] && ! [ -h "%(target)s" ] ); then echo false; fi', {
          target: target
        });

        return shipit.remote(cmd).then(function(response) {
          response.forEach(function(elem) {
            if (elem.stdout.trim() === 'false') {
              throw new Error(sprintf('Cannot create shared symlink, file exists: %(target)s', {
                target: target
              }));
            }
          });
        })
      };

      return new Promise(function(resolve, reject) {
        return file.overwrite ? resolve(file.overwrite) : check();
      }).then(function() {
        var cmd = sprintf('if ( ! [ -h "%(target)s" ] ); then rm -rf "%(target)s" 2> /dev/null; ln -s "%(source)s" "%(target)s"; fi', {
          source: source,
          target: target
        });

        return shipit.remote(cmd);
      });

    });
  }

  function linkDirs() {
    var shipit = utils.getShipit(gruntOrShipit);
    return init(shipit).then(function(shipit) {
      if (!shipit.config.shared.dirs.length) {
        return Bluebird.resolve();
      }

      var promises = shipit.config.shared.dirs.map(function(path) {
        link(path);
      });

      return new Bluebird.all(promises)
      .then(function () {
        shipit.log(chalk.green('Shared directories symlinked on remote.'));
      })
      .then(function () {
        shipit.emit('shared:link:dirs');
      });
    });
  }

  function linkFiles() {
    var shipit = utils.getShipit(gruntOrShipit);
    return init(shipit).then(function(shipit) {
      if (!shipit.config.shared.files.length) {
        return Bluebird.resolve();
      }

      var promises = shipit.config.shared.files.map(function(path) {
        link(path);
      });

      return new Bluebird.all(promises)
      .then(function () {
        shipit.log(chalk.green('Shared files symlinked on remote.'));
      })
      .then(function () {
        shipit.emit('shared:link:files')
      });
    });
  }
};
