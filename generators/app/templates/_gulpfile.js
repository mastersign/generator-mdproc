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
var gulp = require('gulp-help')(require('gulp'));
var watch = require('gulp-watch');
var mdproc = require('mdproc');

var cfg = require('./config/mdproc.json');
var preProcess = require('./config/preprocessing.js');

gulp.task('prepare-target-dir', false, function (cb) {
	mkdirp(cfg.target_dir, cb);
});
<% if (projectType === 'Personal Log') { %>
gulp.task('entry-for-today', false, function (cb) {
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

gulp.task('update-log-index', false, function (cb) {
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

gulp.task('today', 'Create a new file for todays entries', function (cb) {
	runSequence(
		'entry-for-today',
		'update-log-index',
		cb);
});
<% } %>
gulp.task('copy-images', false, function () {
	return gulp.src(cfg.image_files, { base: 'src' })
		.pipe(gulp.dest(cfg.target_dir));
});

gulp.task('html', 'Build the HTML output', 
	['prepare-target-dir', 'copy-images'],
	mdproc.buildHtmlTask(
		cfg.markdown_files, cfg.target_dir,
		{
			imgFormat: 'svg',
			customTransformation: preProcess
		}));

gulp.task('docx', 'Build the DOCX output',
	['prepare-target-dir', 'copy-images'],
	mdproc.buildDocxTask(
		cfg.markdown_files, cfg.target_dir,
		{
			customTransformation: preProcess
		}));
<% if (supportPdf) { %>
gulp.task('tex', 'Build the TEX output',
	['prepare-target-dir', 'copy-images'],
	mdproc.buildLaTeXTask(
		cfg.markdown_files, cfg.target_dir,
		{
			vars: cfg.latex_vars,
			customTransformation: preProcess
		}));

gulp.task('pdf', 'Build the PDF output',
	['prepare-target-dir', 'copy-images'],
	mdproc.buildPdfTask(
		cfg.markdown_files, cfg.target_dir,
		{
			vars: cfg.latex_vars,
			customTransformation: preProcess
		}));
<% } %>
gulp.task('all', 'Build the output in all formats',
	['html', 'docx'<% if (supportPdf) { %>, 'tex', 'pdf'<% } %>]);

gulp.task('autobuild', false, cfg.default_formats);

gulp.task('watch', 'Watch the source files and build automatically',
	['autobuild'], function () {
	watch(cfg.watched_files,
		{ verbose: true, readDelay: 200 },
		function () { gulp.start('autobuild'); });
});

gulp.task('default', 'Build the output in the default formats', 
	['autobuild']);
