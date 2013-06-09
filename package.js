var git = require('./lib/git')(),
    fs = require('fs'),
    http = require('http'),
    remove = require('remove'),
    targz = require('tar.gz');

var GAIA = __dirname + '/gaia/';
var PREBUILD = __dirname + '/profiles/';

function cloneGaia() {
  var REPO = 'git://github.com/mozilla-b2g/gaia.git';

  git.exec(['clone', REPO], function(err, res) {
    testGaia();
  });
}

function createProfile(gaia, branch, callback) {
  console.log('Copying profile for: ', branch);
  var source = gaia.dir + '/profile';
  var target = PREBUILD + '/' + branch + '.tar.gz';

  gaia.makeBranch(branch, function(err) {
    if (err) return console.error(err);
    new targz().compress(source, target, function(err) {
      if (err) return console.error(err);
      console.log('done saved target: ', target);
      callback();
    });
  });
}


var EXCLUDES = ['HEAD'];
function findBranches() {
  var gaia = new (require('./lib/gaia').Gaia)(GAIA);
  gaia.branches(function(err, list) {
    list = list.filter(function(item) {
      if (EXCLUDES.indexOf(item) === -1)
        return true;

      return false;
    });

    function next() {
      var branch = list.shift();
      if (!branch) {
        return console.log('Done!');
      }

      createProfile(gaia, branch, next);
    }

    next();
  });
}

if (fs.existsSync(GAIA)) {
  findBranches();
} else {
  cloneGaia();
}
