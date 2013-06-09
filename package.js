var git = require('./build/git')(),
    fs = require('fs'),
    http = require('http'),
    remove = require('remove'),
    targz = require('tar.gz');

var GAIA = __dirname + '/gaia/';

function cloneGaia() {
  var REPO = 'git://github.com/mozilla-b2g/gaia.git';

  git.exec(['clone', REPO], function(err, res) {
    testGaia();
  });
}

function createProfile(gaia, branch, callback) {
  console.log('Copying profile for: ', branch);
  var relative = 'profiles/' + branch + '.tar.gz';
  var source = gaia.dir + '/profile';
  var target = __dirname + '/' + relative;

  gaia.makeBranch(branch, function(err) {
    if (err) return console.error(err);
    new targz().compress(source, target, function(err) {
      if (err) return console.error(err);
      console.log('done saved target: ', target);
      callback(null, relative);
    });
  });
}


var EXCLUDES = ['HEAD'];
function findBranches() {
  var gaia = new (require('./build/gaia').Gaia)(GAIA);
  gaia.branches(function(err, list) {
    list = list.filter(function(item) {
      if (EXCLUDES.indexOf(item) === -1)
        return true;

      return false;
    });

    var createdProfiles = {};

    function next() {
      var branch = list.shift();
      if (!branch) {
        fs.writeFileSync(
          __dirname + '/profiles/index.json',
          JSON.stringify(createdProfiles)
        );
        return console.log('Done!');
      }

      createProfile(gaia, branch, function(err, path) {
        createdProfiles[branch] = path;
        process.nextTick(next);
      });
    }

    next();
  });
}

if (fs.existsSync(GAIA)) {
  findBranches();
} else {
  cloneGaia();
}
