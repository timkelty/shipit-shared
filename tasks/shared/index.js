var registerTask = require('../../lib/register-task');

module.exports = function (gruntOrShipit) {
  require('./create-dirs')(gruntOrShipit);
  require('./link-dirs')(gruntOrShipit);
  require('./link-files')(gruntOrShipit);

  registerTask(gruntOrShipit, 'shared', [
    'shared:create-remote-dirs',
    'shared:link',
  ]);

  gruntOrShipit.on('deploy:published', function () {
    gruntOrShipit.run('shared');
  });
};
