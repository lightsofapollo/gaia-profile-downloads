var exec = require('child_process').exec;
var GIT_CMD = 'git';

function Git(cwd) {
  if (!(this instanceof Git))
    return new Git(cwd);

  if (!cwd)
    cwd = process.cwd();

  this.cwd = cwd;
}

Git.prototype.exec = function(argv, callback) {
  var command = GIT_CMD + ' ' + argv.join(' ');
  exec(command, { cwd: this.cwd }, callback);
};

module.exports = Git;
