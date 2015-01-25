var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var chalk = require('chalk');

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'shared:create-dirs', task);
};
