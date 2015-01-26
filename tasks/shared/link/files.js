var registerTask = require('../../../lib/register-task');
var getShipit = require('../../../lib/get-shipit');
var sprintf = require('sprintf-js').sprintf;
var _ = require('lodash');
var link = require('../link').link;

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'shared:link:files', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);
    var typeLabel = 'files';

    shipit.log('Symlinking shared ' + typeLabel + ' on remote.');

    return shipit.linkedFiles.forEach(function(path) {
      link(path, true);
    })
    .then(function () {
      shipit.log(chalk.green('Shared ' + typeLabel + ' symlinked on remote.'));
    });
  }

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
