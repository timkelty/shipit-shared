var utils = require('shipit-utils');
var chalk = require('chalk');
var util = require('util');
var init = require('../../lib/init');
var mapPromise = require('../../lib/map-promise');
var Promise = require('bluebird');
var path = require('path2/posix');
var _ = require('lodash');

/**
 * Create required directories for linked files and dirs.
 */

module.exports = function(gruntOrShipit) {

  var task = function task() {
    var shipit = utils.getShipit(gruntOrShipit);

    var setPermissions = function setPermissions(el) {
      var filePath = shipit.config.shared.remote ? path.join(shipit.config.shared.basePath, el.path) : el.path;

      if (el.chmod) {
        return shipit[shipit.config.shared.shipitMethod](util.format('chmod %s', el.chmod, filePath));
      }

      return false;
    };

    return init(shipit).then(function(shipit) {
      shipit.log(util.format('Setting permissions on %s.', shipit.config.shared.shipitMethod));

      return mapPromise(shipit.config.shared.dirs, setPermissions)
      .then(mapPromise(shipit.config.shared.files, setPermissions))
      .then(function() {
        shipit.log(chalk.green(util.format('Permissions set on %s.', shipit.config.shared.shipitMethod)));
      })
      .then(function() {
        shipit.emit('sharedPermissionsSet');
      });

    });
  };

  utils.registerTask(gruntOrShipit, 'shared:set-permissions', task);
};
