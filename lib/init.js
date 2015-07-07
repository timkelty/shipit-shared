var path = require('path');

module.exports = function (shipit) {
  shipit = require('shipit-deploy/lib/init')(shipit);

  shipit.currentPath = path.join(shipit.config.deployTo, 'current');
  shipit.config.shared = shipit.config.shared || {};
  shipit.config.shared.files = shipit.config.shared.files || [];
  shipit.config.shared.dirs = shipit.config.shared.dirs || [];
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
