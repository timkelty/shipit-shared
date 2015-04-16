var utils = require('shipit-utils');

/**
 * Symlink shared files and directories.
 */

module.exports = function (gruntOrShipit) {
  var shipit = utils.getShipit(gruntOrShipit);
  require('./create-dirs')(gruntOrShipit);
  require('./link')(gruntOrShipit);

  utils.registerTask(gruntOrShipit, 'shared', [
    'shared:create-dirs',
    'shared:link',
  ]);

  shipit.on('published', function () {
    utils.runTask(gruntOrShipit, 'shared');
  });
};
