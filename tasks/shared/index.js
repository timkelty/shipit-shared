var utils = require('shipit-utils');
var init = require('../../lib/init');

/**
 * Symlink shared files and directories.
 */

module.exports = function(gruntOrShipit) {
  var shipit = utils.getShipit(gruntOrShipit);
  require('./create-dirs')(gruntOrShipit);
  require('./link')(gruntOrShipit);

  utils.registerTask(gruntOrShipit, 'shared', [
    'shared:create-dirs',
    'shared:link',
    'shared:end',
  ]);

  // Until utils.registerTask can accept a callback...
  utils.registerTask(gruntOrShipit, 'shared:end', function() {
    shipit.emit('sharedEnd');
  });

  // Trigger on deploy by default
  shipit.on('start', function() {
    var event = shipit.config.shared.triggerEvent;
    event = event !== undefined ? event : 'updated';

    if (event) {
      shipit.on(event, function() {
        shipit.start('shared');
      });
    }
  });
};
