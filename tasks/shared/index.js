var registerTask = require('../../lib/register-task');

module.exports = function (gruntOrShipit) {
  require('./create-dirs')(gruntOrShipit);
  require('./link-dirs')(gruntOrShipit);
  require('./link-files')(gruntOrShipit);

  registerTask(gruntOrShipit, 'shared', [
    'shared:create-dirs',
    'shared:link-dirs',
    'shared:link-files',
  ]);

  gruntOrShipit.on('deploy:published', function () {
    gruntOrShipit.run('shared');
  });
};
