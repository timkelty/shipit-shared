var path = require('path');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(shipit) {

  var normalizePath = function normalizePaths(el, isFile) {
    el = _.isString(el) ? {path: el} : el;
    isFile = isFile || false;

    return _.defaults(el, {
      overwrite: !!shipit.config.shared.overwrite,
      chmod: false,
      isFile: isFile
    });
  };

  // Inherit some methods from deploy's init
  shipit = require('shipit-deploy/lib/init')(shipit);

  // Set defaults
  shipit.config.shared = _.defaults(shipit.config.shared || {}, {
    files: [],
    dirs: [],
    basePath: path.join(shipit.config.deployTo, 'shared'),
    overwrite: false,
    remote: true,
  });
  shipit.config.shared.shipitMethod = shipit.config.shared.remote ? 'remote' : 'local';
  shipit.config.shared.symlinkPath = shipit.config.shared.symlinkPath || shipit.config.shared.basePath;
  shipit.config.shared.files = shipit.config.shared.files.map(normalizePath);
  shipit.config.shared.dirs = shipit.config.shared.dirs.map(normalizePath);

  return Promise.resolve(shipit.releaseDirname ? shipit.releaseDirname : shipit.getCurrentReleaseDirname())
  .then(function(releaseDirname) {
    shipit.releaseDirname = releaseDirname;

    return shipit;
  });
};

