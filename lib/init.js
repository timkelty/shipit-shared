var path = require('path');

/**
 * Create required directories for linked files and dirs.
 * - shared:create-dirs
 */

module.exports = function (shipit) {
  shipit.currentPath = path.join(shipit.config.deployTo, 'current');
  shipit.sharedPath = path.join(shipit.config.deployTo, shipit.config.shared.baseDir || 'shared');
  shipit.config.shared = shipit.config.shared || {};
  shipit.config.shared.files = shipit.config.shared.files || [];
  shipit.config.shared.dirs = shipit.config.shared.dirs || [];
  return shipit;
};
