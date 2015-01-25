module.exports = function (shipit) {
  require('./tasks/create-dirs')(shipit);
  require('./tasks/link-dirs')(shipit);
  require('./tasks/link-files')(shipit);
};
