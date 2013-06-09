var git = require('./lib/git')(),
    fs = require('fs'),
    http = require('http');

var GAIA = __dirname + '/gaia/';

function cloneGaia() {
  var REPO = 'git://github.com/mozilla-b2g/gaia.git';

  git.exec(['clone', REPO], function(err, res) {
    testGaia();
  });
}

function testGaia() {
  var gaia = new (require('./lib/gaia').Gaia)(GAIA);
  gaia.branches(function(err, list) {
    var branch = process.argv[2];
    if (list.indexOf(branch) === -1) {
      return console.error(
        'Invalid branch %s, choose from: %s',
        branch,
        list.join(', ')
      );
    }

    gaia.makeBranch(branch, function() {
      publishDownload();
    });
  });
}

function publishDownload() {
}

if (fs.existsSync(GAIA)) {
  testGaia();
} else {
  cloneGaia();
}
