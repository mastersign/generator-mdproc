'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');

describe('mdproc:app', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({ skipInstall: true })
      .withPrompts({
        projectName: 'test-project-name',
        projectTitle: 'Test Project',
        projectDescription: 'This is a test project.',
        authorName: 'John Doe',
        authorEmail: 'john.doe@server.null'
      })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      'package.json',
      '.editorconfig',
      'gulpfile.js',
      'config.json',
      'LICENSE.md',
      'README.md',
      'test-project-name.sublime-project',
      '.vscode/tasks.json',
      'src/index.md',
      'src/chapters/one.inc.md'
    ]);
  });
});
