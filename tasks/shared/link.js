var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var sprintf = require('sprintf-js').sprintf;
var _ = require('lodash');

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'shared:link', [
    'shared:link:dirs',
    'shared:link:files',
  ]);

  function link(path, isFile) {
    return shipit.remote(
      sprintf('if [ -e %(source)s ]; then if ! [ -L %(target)s ]; then if [ %(targetTest)s %(target)s ]; then rm %(targetRmArgs)s %(target)s; fi; ln -s %(source)s %(target)s; fi; fi', {
        source: path.join(options.sharedPath, path),
        target: path.join(options.currentPath, path),
        targetTest: isFile ? '-d' : '-f',
        targetRmArgs: isFile ? '-rf' : '',
      })
    );
  }
};
