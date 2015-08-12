// object variables
var fs = require('fs');
var mocha = require('mocha');
var sinon = require('sinon');
require('sinon-as-promised');
var sinonchai = require('sinon-chai');
var expect = require('chai').use(require('sinon-chai')).expect;
var Shipit = require('shipit-cli');
var shipit; //local-to-test temporary variable
var remoteStub;

describe('Shipit-Shared', function () {
  describe('Worker functions', function () {
    //Create new shipit instance per-test,
    //these bits can and will be modified if needed to suit test
    beforeEach(function () {
      shipit = new Shipit({
        environment: 'test',
        log: sinon.stub()
      });
      shipit.stage = 'test';

      require('../')(shipit);

      shipit.initConfig({
        test: {
          deployTo: '/tmplocal/deploy',
          shared: {
            overwrite: true,
            dirs: [
              'storage',
              {
                path: 'db',
                overwrite: false,
                chmod: '-R 777',
              }
            ],
            files: [
              'environment.yml',
              {
                path: 'config/database.yml',
                overwrite: false,
                chmod: '755',
              }
            ],
          }
        }
      });
      shipit.releaseDirname = '7357';

      remoteStub = sinon.stub(shipit, 'remote').resolves([]);
    });

    it('shared:create-dirs', function(done) {
      shipit.start('shared:create-dirs', function (err) {
        if (err) throw err;
        expect(shipit.remote).calledWith('mkdir -p /tmplocal/deploy/shared/storage');
        expect(shipit.remote).calledWith('mkdir -p /tmplocal/deploy/shared/db');
        expect(shipit.remote).calledWith('mkdir -p $(dirname /tmplocal/deploy/shared/environment.yml)');
        expect(shipit.remote).calledWith('mkdir -p $(dirname /tmplocal/deploy/shared/config/database.yml)');
        expect(remoteStub.callCount).to.equal(4);
        done();
      });
    });

    it('shared:set-permissions', function(done) {
      shipit.start('shared:set-permissions', function (err) {
        if (err) throw err;
        expect(shipit.remote).calledWith('chmod -R 777 /tmplocal/deploy/shared/db');
        expect(shipit.remote).calledWith('chmod 755 /tmplocal/deploy/shared/config/database.yml');
        expect(remoteStub.callCount).to.equal(2);
        done();
      });
    });

    it('shared:link:dirs', function(done) {
      shipit.start('shared:link:dirs', function (err) {
        if (err) throw err;
        expect(shipit.remote).calledWith('if ( [ -e "/tmplocal/deploy/releases/7357/db" ] && ! [ -h "/tmplocal/deploy/releases/7357/db" ] ); then echo false; fi');
        expect(shipit.remote).calledWith('if ( ! [ -e "/tmplocal/deploy/shared/storage" ] ); then cp -r "/tmplocal/deploy/releases/7357/storage" "/tmplocal/deploy/shared/storage"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -h "/tmplocal/deploy/releases/7357/storage" ] ); then rm -rf "/tmplocal/deploy/releases/7357/storage" 2> /dev/null; ln -s "/tmplocal/deploy/shared/storage" "/tmplocal/deploy/releases/7357/storage"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -e "/tmplocal/deploy/shared/db" ] ); then cp -r "/tmplocal/deploy/releases/7357/db" "/tmplocal/deploy/shared/db"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -h "/tmplocal/deploy/releases/7357/db" ] ); then rm -rf "/tmplocal/deploy/releases/7357/db" 2> /dev/null; ln -s "/tmplocal/deploy/shared/db" "/tmplocal/deploy/releases/7357/db"; fi');
        expect(remoteStub.callCount).to.equal(5);
        done();
      });
    });

    it('shared:link:files', function(done) {
      shipit.start('shared:link:files', function (err) {
        if (err) throw err;
        expect(shipit.remote).calledWith('if ( [ -e "/tmplocal/deploy/releases/7357/config/database.yml" ] && ! [ -h "/tmplocal/deploy/releases/7357/config/database.yml" ] ); then echo false; fi');
        expect(shipit.remote).calledWith('if ( ! [ -e "/tmplocal/deploy/shared/config/database.yml" ] ); then cp -r "/tmplocal/deploy/releases/7357/config/database.yml" "/tmplocal/deploy/shared/config/database.yml"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -h "/tmplocal/deploy/releases/7357/config/database.yml" ] ); then rm -rf "/tmplocal/deploy/releases/7357/config/database.yml" 2> /dev/null; ln -s "/tmplocal/deploy/shared/config/database.yml" "/tmplocal/deploy/releases/7357/config/database.yml"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -e "/tmplocal/deploy/shared/environment.yml" ] ); then cp -r "/tmplocal/deploy/releases/7357/environment.yml" "/tmplocal/deploy/shared/environment.yml"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -h "/tmplocal/deploy/releases/7357/environment.yml" ] ); then rm -rf "/tmplocal/deploy/releases/7357/environment.yml" 2> /dev/null; ln -s "/tmplocal/deploy/shared/environment.yml" "/tmplocal/deploy/releases/7357/environment.yml"; fi');
        expect(remoteStub.callCount).to.equal(5);
        done();
      });
    });

    it('alternative overwrite flags for shared:link:dirs', function(done) {
      //quickly flip-flop overwrite flags in config
      shipit.initConfig({
        test: {
          deployTo: '/tmplocal/deploy',
          shared: {
            overwrite: false,
            dirs: [
              'storage',
              {
                path: 'db',
                overwrite: true,
              }
            ],
            files: [],
          }
        }
      });
      shipit.start('shared:link:dirs', function (err) {
        if (err) throw err;
        expect(shipit.remote).calledWith('if ( [ -e "/tmplocal/deploy/releases/7357/storage" ] && ! [ -h "/tmplocal/deploy/releases/7357/storage" ] ); then echo false; fi');
        expect(shipit.remote).calledWith('if ( ! [ -e "/tmplocal/deploy/shared/storage" ] ); then cp -r "/tmplocal/deploy/releases/7357/storage" "/tmplocal/deploy/shared/storage"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -h "/tmplocal/deploy/releases/7357/storage" ] ); then rm -rf "/tmplocal/deploy/releases/7357/storage" 2> /dev/null; ln -s "/tmplocal/deploy/shared/storage" "/tmplocal/deploy/releases/7357/storage"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -e "/tmplocal/deploy/shared/db" ] ); then cp -r "/tmplocal/deploy/releases/7357/db" "/tmplocal/deploy/shared/db"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -h "/tmplocal/deploy/releases/7357/db" ] ); then rm -rf "/tmplocal/deploy/releases/7357/db" 2> /dev/null; ln -s "/tmplocal/deploy/shared/db" "/tmplocal/deploy/releases/7357/db"; fi');
        expect(remoteStub.callCount).to.equal(5);
        done();
      });
    });

    it('alternative overwrite flags for shared:link:files', function(done) {
      //quickly flip-flop overwrite flags in config
      shipit.initConfig({
        test: {
          deployTo: '/tmplocal/deploy',
          shared: {
            overwrite: false,
            dirs: [],
            files: [
              'environment.yml',
              {
                path: 'config/database.yml',
                overwrite: true,
              }
            ],
          }
        }
      });
      shipit.start('shared:link:files', function (err) {
        if (err) throw err;
        expect(shipit.remote).calledWith('if ( [ -e "/tmplocal/deploy/releases/7357/environment.yml" ] && ! [ -h "/tmplocal/deploy/releases/7357/environment.yml" ] ); then echo false; fi');
        expect(shipit.remote).calledWith('if ( ! [ -e "/tmplocal/deploy/shared/config/database.yml" ] ); then cp -r "/tmplocal/deploy/releases/7357/config/database.yml" "/tmplocal/deploy/shared/config/database.yml"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -h "/tmplocal/deploy/releases/7357/config/database.yml" ] ); then rm -rf "/tmplocal/deploy/releases/7357/config/database.yml" 2> /dev/null; ln -s "/tmplocal/deploy/shared/config/database.yml" "/tmplocal/deploy/releases/7357/config/database.yml"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -e "/tmplocal/deploy/shared/environment.yml" ] ); then cp -r "/tmplocal/deploy/releases/7357/environment.yml" "/tmplocal/deploy/shared/environment.yml"; fi');
        expect(shipit.remote).calledWith('if ( ! [ -h "/tmplocal/deploy/releases/7357/environment.yml" ] ); then rm -rf "/tmplocal/deploy/releases/7357/environment.yml" 2> /dev/null; ln -s "/tmplocal/deploy/shared/environment.yml" "/tmplocal/deploy/releases/7357/environment.yml"; fi');
        expect(remoteStub.callCount).to.equal(5);
        done();
      });
    });

    afterEach(function () {
      shipit.remote.restore();
    });
  });
  describe('Overall functionality', function () {
    //Create new shipit instance per-test,
    //these bits can and will be modified if needed to suit test
    beforeEach(function () {
      shipit = new Shipit({
        environment: 'test',
        log: sinon.stub()
        // log: console.log()
      });
      shipit.stage = 'test';

      require('../')(shipit);
      shipit.releaseDirname = '7357';

      remoteStub = sinon.stub(shipit, 'remote').resolves([]);
    });

    it('Overall Execution and basePath', function(done) {
      shipit.initConfig({
        test: {
          deployTo: '/tmplocal/deploy',
          shared: {
            overwrite: true,
            basePath: 'TRANS',
            dirs: [
              'storage',
              {
                path: 'db',
                overwrite: false,
                chmod: '-R 777',
              }
            ],
            files: [
              'environment.yml',
              {
                path: 'config/database.yml',
                overwrite: false,
                chmod: '755',
              }
            ],
          }
        }
      });
      shipit.start('shared', function (err) {
        if (err) throw err;
        expect(shipit.remote).calledWith('mkdir -p TRANS/storage');
        expect(shipit.remote).calledWith('mkdir -p TRANS/db');
        expect(shipit.remote).calledWith('mkdir -p $(dirname TRANS/environment.yml)');
        expect(shipit.remote).calledWith('mkdir -p $(dirname TRANS/config/database.yml)');

        expect(shipit.remote).calledWith('chmod -R 777 TRANS/db');
        expect(shipit.remote).calledWith('chmod 755 TRANS/config/database.yml');

        expect(shipit.remote).calledWith('if ( [ -e "/tmplocal/deploy/releases/7357/db" ] && ! [ -h "/tmplocal/deploy/releases/7357/db" ] ); then echo false; fi');

        expect(shipit.remote).calledWith('if ( [ -e "/tmplocal/deploy/releases/7357/config/database.yml" ] && ! [ -h "/tmplocal/deploy/releases/7357/config/database.yml" ] ); then echo false; fi');
        expect(remoteStub.callCount).to.equal(16);
        done();
      });
    });

  it('symlinkPath', function(done) {
      shipit.initConfig({
        test: {
          deployTo: '/tmplocal/deploy',
          shared: {
            overwrite: true,
            basePath: 'TRANS',
            symlinkPath: 'SYMTRANS',
            dirs: [
              'storage',
              {
                path: 'db',
                overwrite: false,
                chmod: '-R 777',
              }
            ],
            files: [
              'environment.yml',
              {
                path: 'config/database.yml',
                overwrite: false,
                chmod: '755',
              }
            ],
          }
        }
      });
      shipit.start('shared:link', function (err) {
        if (err) throw err;
        expect(shipit.remote).calledWith('if ( ! [ -h "/tmplocal/deploy/releases/7357/environment.yml" ] ); then rm -rf "/tmplocal/deploy/releases/7357/environment.yml" 2> /dev/null; ln -s "SYMTRANS/environment.yml" "/tmplocal/deploy/releases/7357/environment.yml"; fi');

        expect(shipit.remote).calledWith('if ( ! [ -h "/tmplocal/deploy/releases/7357/storage" ] ); then rm -rf "/tmplocal/deploy/releases/7357/storage" 2> /dev/null; ln -s "SYMTRANS/storage" "/tmplocal/deploy/releases/7357/storage"; fi');

        expect(remoteStub.callCount).to.equal(10);
        done();
      });
    });

    it('triggerEvent (minimum 2000ms)', function(done) {
      this.timeout(5000);
      shipit.initConfig({
        test: {
          deployTo: '/tmplocal/deploy',
          shared: {
            overwrite: true,
            triggerEvent: 'testTrigger',
            dirs: [
              'storage',
              {
                path: 'db',
                overwrite: false,
                chmod: '-R 777',
              }
            ],
            files: [
              'environment.yml',
              {
                path: 'config/database.yml',
                overwrite: false,
                chmod: '755',
              }
            ],
          }
        }
      });

      shipit.start('shared:link', function (err) {
        if (err) throw err;
      });

      shipit.emit('testTrigger');
      setTimeout(function(){
        expect(remoteStub.callCount).to.equal(16);
        done();
      }, 2000);
    });

    afterEach(function () {
      shipit.remote.restore();
    });
  });
});
