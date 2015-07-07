var utils = require('shipit-utils');
var sprintf = require('sprintf-js').sprintf;
var path = require('path2/posix');
var chalk = require('chalk');
var Bluebird = require('bluebird');
var init = require('../../lib/init');

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

  function link(filePath) {
    var shipit = utils.getShipit(gruntOrShipit);

    return init(shipit).then(function(shipit) {

      var cmd = [];
      cmd.push('if ( ! [ -h "%(target)s" ] ) || ( [ -h "%(target)s" ] && [ $(readlink "%(target)s" != "%(source)s") ] ); then');
      cmd.push('rm -r "%(target)s" 2> /dev/null;');
      cmd.push('ln -s "%(source)s" "%(target)s";');
      cmd.push('fi');

      return shipit.remote(
        sprintf(cmd.join(' '), {
          source: path.join(shipit.sharedSymlinkPath, filePath),
          target: path.join(shipit.releasesPath, shipit.releaseDirname, filePath)
        })
      );
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
