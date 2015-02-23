var utils = require('shipit-utils');
var chalk = require('chalk');
var sprintf = require('sprintf-js').sprintf;

/**
 * Create required directories for linked files and dirs.
 * - shared:create-dirs
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'shared:create-dirs', task);

  function task() {
    var shipit = utils.getShipit(gruntOrShipit);

    function createDirs(paths, remote, isFile) {
      isFile = isFile || false;
      var method = remote ? 'remote' : 'local';
      var pathStr = paths.map(function(path) {
        return isFile ? sprintf('$(dirname %s)', path) : path;
      }).join(' ');

      return shipit[method](
        sprintf('mkdir -p %s', pathStr)
      );
    }

    shipit.log('Creating shared directories on remote.');

    return createDirs(shipit.config.shared.dirs, true, false)
    .then(createDirs(shipit.config.shared.files, true, true))
    .then(function () {
      shipit.emit('dirs-created');
      shipit.log(chalk.green('Shared directories created on remote.'));
    });
  }
};
