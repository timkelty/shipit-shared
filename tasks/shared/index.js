var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');

/**
 * Symlink shared files and directories.
 * - shared:create-remote-dirs
 * - shared:link
 */

module.exports = function (gruntOrShipit) {
  var shipit = getShipit(gruntOrShipit);
  require('./create-dirs')(shipit);
  require('./link')(shipit);

  registerTask(shipit, 'shared', [
    'shared:create-dirs',
    'shared:link',
  ]);

  shipit.on('published', function () {
    shipit.start('shared');
  });
};
