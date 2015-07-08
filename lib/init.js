var path = require('path');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function (shipit) {

  var normalizePath = function normalizePaths(el) {
    el = _.isString(el) ? {path: el} : el;

    return  _.defaults(el, {
      overwrite: shipit.config.shared.overwrite || false
    });
  };

  shipit = require('shipit-deploy/lib/init')(shipit);
  shipit.currentPath = path.join(shipit.config.deployTo, 'current');
  shipit.config.shared = shipit.config.shared || {};
  shipit.config.shared.files = shipit.config.shared.files || [];
  shipit.config.shared.files = shipit.config.shared.files.map(normalizePath);
  shipit.config.shared.dirs = shipit.config.shared.dirs || [];
  shipit.config.shared.dirs = shipit.config.shared.dirs.map(normalizePath);
  shipit.sharedPath = shipit.config.shared.path || path.join(shipit.config.deployTo, 'shared');

  // For chrooted environments
  // https://github.com/timkelty/shipit-shared/issues/7
  shipit.sharedSymlinkPath = shipit.config.shared.symlinkPath || shipit.sharedPath;

  return Promise.resolve(shipit.releaseDirname ? shipit.releaseDirname : shipit.getCurrentReleaseDirname())
  .then(function(releaseDirname) {
    shipit.releaseDirname = releaseDirname;
    return shipit;
  });
};

