/* globals require */

var os = require('os');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
<% if (needsLodash) { %>var _ = require('lodash');
<% } if (needsGlob) { %>var glob = require('glob');
<% } if (needsDateFormat) { %>var dateFormat = require('dateformat');
<% } if (needsRunSequence) { %>var runSequence = require('run-sequence');
<% } %>
var gulp = require('gulp');
var watch = require('gulp-watch');
var mdproc = require('mdproc');

var cfg = require('./config/mdproc.json');
var preProcess = require('./config/preprocessing.js');

gulp.task('prepare-target-dir', function (cb) {
	mkdirp(cfg.target_dir, cb);
});
<% if (projectType === 'Personal Log') { %>
gulp.task('entry-for-today', function (cb) {
	var now = new Date();
	var yearDir = path.join('src', 'log', dateFormat(now, 'yyyy'));
	var monthDir = path.join(yearDir, dateFormat(now, 'mm'));
	var entryFile = path.join(monthDir, dateFormat(now, 'yyyy-mm-dd') + '.md');
	var headline = '## ' + dateFormat('yyyy-mm-dd dddd') +
		' {#log_' + dateFormat('yyyy-mm-dd') + '}';
	var text = headline + os.EOL + os.EOL;
	mkdirp(monthDir, function (err) {
		if (err) {
			cb(err);
			return;
		}
		fs.stat(entryFile, function (err, stats) {
			if (err && err.code === 'ENOENT') {
				fs.writeFile(entryFile, text, 'utf8', cb);
			} else {
				cb(err);
			}
		});
	});
});

gulp.task('update-log-index', function (cb) {
	var logBase = path.join('src', 'log');
	glob(logBase + '/????/??/????-??-??.md', function (err, files) {
		if (err) {
			cb(err);
			return;
		}
		mkdirp(logBase, function (err) {
			if (err) {
				cb(err);
				return;
			}
			fs.writeFile(path.join(logBase, 'index.md'),
				_.map(files, function (f) {
					return '<!-- #include ' + f.slice(logBase.length + 1) + ' -->';
				}).join('\n'),
				'utf8',
				cb);
		});
	});
});

gulp.task('today', function (cb) {
	runSequence(
		'entry-for-today',
		'update-log-index',
		cb);
});
<% } %>
gulp.task('copy-images', function () {
	return gulp.src(cfg.image_files, { base: 'src' })
		.pipe(gulp.dest(cfg.target_dir));
});

gulp.task('html', ['prepare-target-dir', 'copy-images'],
	mdproc.buildHtmlTask(
		cfg.markdown_files, cfg.target_dir,
		{
			imgFormat: 'svg',
			customTransformation: preProcess
		}));

gulp.task('docx', ['prepare-target-dir', 'copy-images'],
	mdproc.buildDocxTask(
		cfg.markdown_files, cfg.target_dir,
		{
			customTransformation: preProcess
		}));
<% if (supportPdf) { %>
gulp.task('tex', ['prepare-target-dir', 'copy-images'],
	mdproc.buildLaTeXTask(
		cfg.markdown_files, cfg.target_dir,
		{
			vars: cfg.latex_vars,
			customTransformation: preProcess
		}));

gulp.task('pdf', ['prepare-target-dir', 'copy-images'],
	mdproc.buildPdfTask(
		cfg.markdown_files, cfg.target_dir,
		{
			vars: cfg.latex_vars,
			customTransformation: preProcess
		}));
<% } %>
gulp.task('all', ['html', 'docx'<% if (supportPdf) { %>, 'tex', 'pdf'<% } %>]);

gulp.task('autobuild', cfg.default_formats);

gulp.task('watch', ['autobuild'], function () {
	watch(cfg.watch_files,
		{ verbose: true, readDelay: 200 },
		function () { gulp.start('autobuild'); });
});

gulp.task('default', ['autobuild']);
