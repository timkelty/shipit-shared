var utils = require('shipit-utils');
var init = require('../../lib/init');

/**
 * Symlink shared files and directories.
 */

module.exports = function (gruntOrShipit) {
  var shipit = utils.getShipit(gruntOrShipit);
  require('./create-dirs')(gruntOrShipit);
  require('./link')(gruntOrShipit);

  utils.registerTask(gruntOrShipit, 'shared', [
    'shared:create-dirs',
    'shared:link'
  ]);

  // Trigger on deploy by default
  if (shipit.config.shared.triggerOn) {
    shipit.on(shipit.config.shared.triggerOn, function () {
      utils.runTask(gruntOrShipit, 'shared');
    });
  }
};
