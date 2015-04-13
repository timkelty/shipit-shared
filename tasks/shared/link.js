var utils = require('shipit-utils');
var sprintf = require('sprintf-js').sprintf;
var path = require('path2/posix');
var chalk = require('chalk');
var Bluebird = require('bluebird');
var init = require('../../lib/init');

/**
 * Create shared symlinks.
 * - shared:link
 * - shared:link:dirs
 * - shared:link:files
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'shared:link:dirs', linkDirs);
  utils.registerTask(gruntOrShipit, 'shared:link:files', linkFiles);
  utils.registerTask(gruntOrShipit, 'shared:link', [
    'shared:link:dirs',
    'shared:link:files'
  ]);

  function link(filePath, isFile) {
    var shipit = utils.getShipit(gruntOrShipit);
    shipit = init(shipit);

    return shipit.remote(
      sprintf('if [ -e %(source)s ]; then if ! [ -L %(target)s ]; then if [ %(targetTest)s %(target)s ]; then rm %(targetRmArgs)s %(target)s; fi; ln -s %(source)s %(target)s; fi; fi', {
        source: path.join(shipit.sharedSymlinkPath, filePath),
        target: path.join(shipit.currentPath, filePath),
        targetTest: isFile ? '-d' : '-f',
        targetRmArgs: isFile ? '-rf' : '',
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
      link(path, false);
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
      link(path, true);
    });

    return new Bluebird.all(promises)
    .then(function () {
      shipit.log(chalk.green('Shared files symlinked on remote.'));
    });
  }
};
