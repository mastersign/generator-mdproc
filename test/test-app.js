/* globals __dirname, require, describe, it, before */
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var cmdExists = require('command-exists').sync;
var childproc = require('child_process');


describe('mdproc:app', function () {
	describe('Minimal', function () {

		var tmpDirPath = null;

		function runCliTool(cmd, cb) {
			var proc = childproc.exec(cmd, { cwd: tmpDirPath });
			var tool = cmd.match(/^\w+/)[0];
			proc.on('error', cb);
			proc.on('exit', function (exitCode) {
				if (exitCode !== 0) {
					cb(new Error('Command ' + tool + ' exited with status code ' + exitCode));
				} else {
					cb();
				}
			});
		}

		before(function (done) {
			helpers.run(path.join(__dirname, '../generators/app'))
				.inTmpDir(function (dir) {
					tmpDirPath = dir;
					// console.log('      working dir: ' + dir);
				})
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

		describe('build', function () {

			before('installing dependencies', function (done) {
				this.timeout(120000);
				if (cmdExists('yarn')) {
					runCliTool('yarn install', done);
				} else if (cmdExists('npm')) {
					runCliTool('npm install', done);
				} else {
					done();
				}
			});

			describe('HTML', function () {
				before ('running gulp', function (done) {
					this.timeout(30000);
					if (cmdExists('pandoc')) {
						runCliTool('yarn gulp html', done);
					} else {
						done();
					}
				});

				it('should have build the HTML output', function () {
					if (!(cmdExists('yarn') || cmdExists('npm')) ||
						!cmdExists('pandoc')) {
						this.skip();
						return;
					}
					assert.file([
						'out/index.html'
					]);
				});
			});

			describe('DOCX', function () {
				before ('running gulp', function (done) {
					this.timeout(30000);
					if (cmdExists('pandoc')) {
						runCliTool('yarn gulp docx', done);
					} else {
						done();
					}
				});

				it('should have build the DOCX output', function () {
					if (!(cmdExists('yarn') || cmdExists('npm')) ||
					    !cmdExists('pandoc')) {
						this.skip();
						return;
					}
					assert.file([
						'out/index.docx'
					]);
				});
			});
		});
	});
});
