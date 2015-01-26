var registerTask = require('../../lib/register-task');

/**
 * Symlink shared files and directories.
 * - shared:create-remote-dirs
 * - shared:link
 */

module.exports = function (gruntOrShipit) {
  require('./create-dirs')(gruntOrShipit);
  require('./link')(gruntOrShipit);

  registerTask(gruntOrShipit, 'shared', [
    'shared:create-dirs',
    'shared:link',
  ]);

  gruntOrShipit.on('deploy:published', function () {
    gruntOrShipit.run('shared');
  });
};
