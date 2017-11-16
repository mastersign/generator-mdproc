/* globals __dirname, require, describe, it, before */
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('mdproc:app', function () {
	describe('Minimal', function () {
		before(function (done) {
			helpers.run(path.join(__dirname, '../generators/app'))
				.withOptions({ skipInstall: true, skipEnd: true })
				.withPrompts({
					projectType: 'Minimal',
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
				'config/mainfiles',
				'config/mdproc.json',
				'config/graphs.json',
				'config/preprocessing.js',
				'config/html-postprocessing.js',
				'LICENSE.md',
				'README.md',
				'test-project-name.sublime-project',
				'src/index.md'
			]);
		});
	});
});
