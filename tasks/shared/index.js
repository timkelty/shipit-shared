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
  shipit.on('start', function() {
    var event = shipit.config.shared.triggerOn || 'updated';
    if (event) {
      shipit.on(event, function () {
        utils.runTask(gruntOrShipit, 'shared');
      });
    }
  });
};
