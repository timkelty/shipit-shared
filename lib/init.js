var path = require('path');

/**
 * Create required directories for linked files and dirs.
 * - shared:create-dirs
 */

module.exports = function (shipit) {
  shipit.currentPath = path.join(shipit.config.deployTo, 'current');
  shipit.config.shared = shipit.config.shared || {};
  shipit.config.shared.files = shipit.config.shared.files || [];
  shipit.config.shared.dirs = shipit.config.shared.dirs || [];
  shipit.sharedPath = shipit.config.shared.baseDir || 'shared';

  // Allow for an absolute path
  if (!path.isAbsolute(shipit.sharedPath)) {
    shipit.sharedPath = path.join(shipit.config.deployTo, shipit.config.shared.baseDir);
  }

  // Normalize trailing slash
  shipit.sharedPath = shipit.sharedPath.replace(/\/$/g, '');

  return shipit;
};
