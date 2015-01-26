var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var chalk = require('chalk');
var sprintf = require('sprintf-js').sprintf;
var _ = require('lodash');

/**
 * Create remote directories task.
 */

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'shared:create-remote-dirs', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);

    return createDirs(shipit.config.linkedDirs, true, false)
    .then(createDirs(shipit.config.linkedFiles, true, true))
    .then(function () {
      shipit.emit('dirs-created');
    });

    /**
     * Create required directories from array of files or directories
     */

    function createDirs(paths, remote, isFile) {
      isFile = isFile || false;
      var run = remote ? shipit.remote : shipit.local;
      var pathStr = paths.map(function(elem) {
        return isFile ? sprintf('$(dirname %s)', path) : path;
      }).join(' ');

      shipit.log('Creating shared directories on remote.');

      return run(
        sprintf('mkdir -p %s', pathStr)
      )
      .then(function () {
        shipit.log(chalk.green('Shared directories created on remote.'));
      });
    }
  }
};
