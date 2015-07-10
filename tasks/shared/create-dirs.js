var utils = require('shipit-utils');
var chalk = require('chalk');
var util = require('util');
var init = require('../../lib/init');
var mapPromise = require('../../lib/map-promise');
var Promise = require('bluebird');
var path = require('path');

/**
 * Create required directories for linked files and dirs.
 */

module.exports = function(gruntOrShipit) {

  var task = function task() {
    var shipit = utils.getShipit(gruntOrShipit);

    var createDir = function(el) {
      var filePath = shipit.config.shared.remote ? path.join(shipit.config.shared.basePath, el.path) : el.path;
      var pathStr =  el.isFile ? util.format('$(dirname %s)', filePath) : filePath;

      return shipit[shipit.config.shared.shipitMethod](
        util.format('mkdir -p %s', pathStr)
      );
    }

    return init(shipit).then(function(shipit) {
      shipit.log(util.format('Creating shared directories on %s.', shipit.config.shared.shipitMethod));

      return mapPromise(shipit.config.shared.dirs, createDir)
      .then(mapPromise(shipit.config.shared.files, createDir))
      .then(function() {
        shipit.log(chalk.green(util.format('Shared directories created on %s.', shipit.config.shared.shipitMethod)));
      })
      .then(function() {
        shipit.emit('sharedDirsCreated');
      });
    });
  };

  utils.registerTask(gruntOrShipit, 'shared:create-dirs', task);
};
