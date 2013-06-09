var PROFILE_DIR = 'profile/';

var GIT = require('git-wrapper'),
    fs = require('fs'),
    fsPath = require('path'),
    remove = require('remove'),
    debug = require('debug')('gaia-profile-downloads:gaia');

function Gaia(path) {
  this.dir = path;
  this.git = new GIT({
    'git-dir': path + '/.git'
  });
}

Gaia.prototype = {
  removeProfile: function(callback) {
    debug('removeProfile');
    var profilePath = fsPath.join(this.dir, PROFILE_DIR);

    if (!fs.existsSync(profilePath)) {
      debug('removeProfile', 'skip', profilePath);
      return callback();
    }

    remove(profilePath, function(err) {
      if (err) {
        debug('removeProfile', err);
        return callback(err);
      }
    });
  },

  clean: function(callback) {
    debug('clean');
    this.reset(function(err) {
      if (err) return callback(err);
      this.removeProfile(this.update.bind(this, callback));
    }.bind(this));
  },

  reset: function(callback) {
    debug('reset');
    this.git.exec('reset', {'hard': true}, [], function(err) {
      if (err) {
        debug('reset err', err);
        return callback(err);
      }
      callback();
    });
  },

  update: function(callback) {
    debug('update');
    this.git.exec('pull', function(err) {
      if (err) {
        debug('update err', err);
        return callback(err);
      }
      callback();
    });
  },

  checkout: function() {
  }
};

module.exports.Gaia = Gaia;
