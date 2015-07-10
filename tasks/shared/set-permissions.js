var utils = require('shipit-utils');
var chalk = require('chalk');
var util = require('util');
var init = require('../../lib/init');
var Promise = require('bluebird');
var path = require('path');
var _ = require('lodash');

/**
 * Create required directories for linked files and dirs.
 */

module.exports = function(gruntOrShipit) {

  var task = function task() {
    var shipit = utils.getShipit(gruntOrShipit);
    var remote = true;
    var method = remote ? 'remote' : 'local';

    return init(shipit).then(function(shipit) {

      var setPermissions = function setPermissions(paths, remote, isFile) {
        var promises;

        if (!paths.length) {
          return Promise.resolve();
        }

        promises = _.filter(paths.map(function(el) {
          var filePath = path.join(shipit.config.shared.basePath, el.path);
          return el.chmod ? shipit[method](util.format('chmod %s', el.chmod, filePath)) : false;
        }));

        return Promise.all(promises);
      };

      shipit.log(util.format('Setting permissions on %s.', method));

      return setPermissions(shipit.config.shared.dirs, true, false)
      .then(setPermissions(shipit.config.shared.files, true, true))
      .then(function() {
        shipit.log(chalk.green(util.format('Permissions set on %s.', method)));
      })
      .then(function() {
        shipit.emit('sharedPermissionsSet');
      });
    });
  };

  utils.registerTask(gruntOrShipit, 'shared:set-permissions', task);
};
