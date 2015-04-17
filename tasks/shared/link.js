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
    shipit = init(shipit);

    return shipit.remote(
      sprintf('if ( ! [ -h "%(target)s" ] ) || ( [ -h "%(target)s" ] && [ $(readlink -n "%(target)s" ) != "%(source)s" ] ); then rm -r "%(target)s" 2> /dev/null; ln -s "%(source)s" "%(target)s"; fi', {
        source: path.join(shipit.sharedSymlinkPath, filePath),
        target: path.join(shipit.releasesPath, shipit.releaseDirname, filePath)
      })
    );
  }

  function linkDirs() {
    var shipit = utils.getShipit(gruntOrShipit);
    shipit = init(shipit);
    if (!shipit.config.shared.dirs.length) {
      return Bluebird.resolve();
    }

    var promises = shipit.config.shared.dirs.map(function(path) {
      link(path);
    });

    return new Bluebird.all(promises)
    .then(function () {
      shipit.log(chalk.green('Shared directories symlinked on remote.'));
    });
  }

  function linkFiles() {
    var shipit = utils.getShipit(gruntOrShipit);
    shipit = init(shipit);

    if (!shipit.config.shared.files.length) {
      return Bluebird.resolve();
    }

    var promises = shipit.config.shared.files.map(function(path) {
      link(path);
    });

    return new Bluebird.all(promises)
    .then(function () {
      shipit.log(chalk.green('Shared files symlinked on remote.'));
    });
  }
};
