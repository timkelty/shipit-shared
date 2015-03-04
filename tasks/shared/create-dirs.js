var utils = require('shipit-utils');
var chalk = require('chalk');
var sprintf = require('sprintf-js').sprintf;
var init = require('../../lib/init');
var Bluebird = require('bluebird');
var path = require('path');

/**
 * Create required directories for linked files and dirs.
 * - shared:create-dirs
 */

module.exports = function (gruntOrShipit) {

  var task = function task() {
    var shipit = utils.getShipit(gruntOrShipit);
    shipit = init(shipit);

    var createDirs = function createDirs(paths, remote, isFile) {
      if (!paths.length) {
        return Bluebird.resolve();
      }

      isFile = isFile || false;
      var method = remote ? 'remote' : 'local';
      var pathStr = paths.map(function(filePath) {
        filePath = remote ? path.join(shipit.sharedPath, filePath) : filePath;
        return isFile ? sprintf('$(dirname %s)', filePath) : filePath;
      }).join(' ');

      return shipit[method](
        sprintf('mkdir -p %s', pathStr)
      );
    };

    shipit.log('Creating shared directories on remote.');
    return createDirs(shipit.config.shared.dirs, true, false)
    .then(createDirs(shipit.config.shared.files, true, true))
    .then(function () {
      shipit.log(chalk.green('Shared directories created on remote.'));
    });
  };

  utils.registerTask(gruntOrShipit, 'shared:create-dirs', task);
};
