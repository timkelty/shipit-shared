var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var runTask = require('../../lib/run-task');

/**
 * Symlink shared files and directories.
 * - shared:create-remote-dirs
 * - shared:link
 */

module.exports = function (gruntOrShipit) {
  var shipit = getShipit(gruntOrShipit);

  require('./create-dirs')(gruntOrShipit);
  require('./link')(gruntOrShipit);

  registerTask(gruntOrShipit, 'shared', [
    'shared:create-dirs',
    'shared:link',
  ]);

  shipit.on('deploy', function () {
    runTask(gruntOrShipit, 'shared');
  });
};
