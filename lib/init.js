var path = require('path2/posix');
var normalize = require('normalize-path');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(shipit) {
  var normalizePath = function normalizePaths(el, defaults) {
    el = _.isString(el) ? {path: el} : el;

    // Remove all trailing slashes
    el.path = normalize(el.path);

    defaults = _.defaults(defaults || {}, {
      overwrite: !!shipit.config.shared.overwrite,
      chmod: false,
      isFile: false
    });

    return _.defaults(el, defaults);
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
  shipit.config.shared.dirs = shipit.config.shared.dirs.map(function(el) {
    return normalizePath(el);
  });
  shipit.config.shared.files = shipit.config.shared.files.map(function(el) {
    return normalizePath(el, { isFile: true} );
  });

  return Promise.resolve(shipit.releaseDirname ? shipit.releaseDirname : shipit.getCurrentReleaseDirname())
  .then(function(releaseDirname) {
    shipit.releaseDirname = releaseDirname;

    return shipit;
  });
};

