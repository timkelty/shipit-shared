var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var sprintf = require('sprintf-js').sprintf;
var path = require('path');
var chalk = require('chalk');
var Bluebird = require('bluebird');

/**
 * Create shared symlinks.
 * - shared:link
 * - shared:link:dirs
 * - shared:link:files
 */

module.exports = function (gruntOrShipit) {
  var shipit = getShipit(gruntOrShipit);

  registerTask(gruntOrShipit, 'shared:link:dirs', linkDirs);
  registerTask(gruntOrShipit, 'shared:link:files', linkFiles);
  registerTask(gruntOrShipit, 'shared:link', [
    'shared:link:dirs',
    'shared:link:files'
  ]);

  function link(filePath, isFile) {
    shipit.currentPath = path.join(shipit.config.deployTo, 'current');
    shipit.sharedPath = path.join(shipit.config.deployTo, 'shared');

    return shipit.remote(
      sprintf('if [ -e %(source)s ]; then if ! [ -L %(target)s ]; then if [ %(targetTest)s %(target)s ]; then rm %(targetRmArgs)s %(target)s; fi; ln -s %(source)s %(target)s; fi; fi', {
        source: path.join(shipit.sharedPath, filePath),
        target: path.join(shipit.currentPath, filePath),
        targetTest: isFile ? '-d' : '-f',
        targetRmArgs: isFile ? '-rf' : '',
      })
    );
  }

  function linkDirs() {
    var shipit = getShipit(gruntOrShipit);
    var promises = shipit.config.linkedDirs.map(function(path) {
      link(path, false);
    });

    return new Bluebird.all(promises)
    .then(function () {
      shipit.log(chalk.green('Shared directories symlinked on remote.'));
      shipit.emit('dirs-linked');
    });
  }

  function linkFiles() {
    var shipit = getShipit(gruntOrShipit);
    var promises = shipit.config.linkedFiles.map(function(path) {
      link(path, true);
    });

    return new Bluebird.all(promises)
    .then(function () {
      shipit.log(chalk.green('Shared files symlinked on remote.'));
      shipit.emit('files-linked');
    });
  }
};
