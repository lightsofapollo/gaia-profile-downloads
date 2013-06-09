var PROFILE_DIR = 'profile/';
var BRANCH_REGEX = /origin\/([0-9\.a-zA-Z\-]+)/;

var fs = require('fs'),
    fsPath = require('path'),
    remove = require('remove'),
    debug = require('debug')('gaia-profile-downloads:gaia'),
    exec = require('child_process').exec;

function Gaia(path) {
  this.dir = path;
  this.git = require('./git')(path);
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
      callback();
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
    this.git.exec(['reset', '--hard'], function(err) {
      if (err) {
        debug('reset err', err);
        return callback(err);
      }
      callback();
    });
  },

  update: function(callback) {
    debug('update');
    this.git.exec(['pull'], function(err) {
      if (err) {
        debug('update err', err);
        return callback(err);
      }
      callback();
    });
  },

  /***
   * Make the gaia profile
   *
   *  gaia.make(['GAIA_OPTIMIZE=1'], function() {
   *    //
   *  });
   */
  make: function(envs, callback) {
    if (typeof envs === 'function') {
      callback = envs;
      envs = null;
    }

    var command = [
      (envs) ? ' ' + envs.join(' ') : '',
      'make',
      '-C',
      this.dir
    ];

    // DEBUG will interfere with the gaia build system
    // so make a copy of all options and make sure its excluded
    // from out list of environment variables.
    var envCopy = {};
    for (var key in process.env) {
      if (key === 'DEBUG') continue;
      envCopy[key] = process.env[key];
    }

    debug('make', command.join(' '));
    exec(command.join(' '), { env: envCopy }, function(err, stdout, stderr) {
      if (err) return callback(err);
      callback();
    });
  },

  /**
   * List all branches
   */
  branches: function(callback) {
    debug('branches');
    this.git.exec(['branch', '-r', '--no-color'], function(err, stdout) {
      if (err) return callback(err);
      var results = [];
      stdout.split('\n').forEach(function(line) {
        var match = line.match(BRANCH_REGEX);
        if (match && match[1])
          return results.push(match[1]);
      });

      debug('branches', results);
      callback(null, results);
    });
  },

  /**
   * checkout a specific branch of gaia.
   */
  checkout: function(branch, callback) {
    debug('checkout', branch);

    this.git.exec(['checkout', branch], function(err) {
      if (err) return callback(err);
      callback();
    });
  },


  /**
   * Cleans up current working state of repo then
   * switches to new branch and makes the profile.
   */
  makeBranch: function(branch, callback) {
    debug('makeBranch', branch);

    this.clean(function(err) {
      if (err) return callback(err);
      this.checkout(branch, function(err) {
        if (err) return callback(err);
        this.make(callback);
      }.bind(this));
    }.bind(this));
  }
};

module.exports.Gaia = Gaia;
