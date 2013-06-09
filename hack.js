var GIT = require('git-wrapper'),
    fs = require('fs');

var GAIA = __dirname + '/gaia/';

function cloneGaia() {
  var git = new GIT();
  var REPO = 'git://github.com/mozilla-b2g/gaia.git';

  git.exec('clone', [REPO], function(err, res) {
    testGaia();
  });
}

function testGaia() {
  var gaia = new (require('./lib/gaia').Gaia)(GAIA);
  gaia.clean(function() {
  });
}

if (fs.existsSync(GAIA)) {
  testGaia();
} else {
  cloneGaia();
}
