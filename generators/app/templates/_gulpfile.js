/* globals require */

var os = require('os');
var path = require('path');
var fs = require('fs');
var del = require('del');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var gulp = require('gulp-help')(require('gulp'));
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var textTransform = require('gulp-text-simple');
var lazypipe = require('lazypipe');
var es = require('event-stream');
var runSequence = require('run-sequence');
var mdproc = require('mdproc');
var mdinclude = require('mdinclude');
var mdquery = require('mdquery').transform;
<% if (needsGlob) { %>var glob = require('glob');
<% } if (needsDateFormat) { %>var dateFormat = require('dateformat');
<% } if (needsExec) { %>var exec = require('gulp-exec');
<% } %> 

var cfg = require('./config/mdproc.json');
var graphs = require('./config/graphs.json');
var preProcess = textTransform(require('./config/preprocessing.js'));

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

var markdownPipeline = function (opt) {
	return lazypipe()
		.pipe(mdinclude)
		.pipe(mdquery)
		.pipe(mdproc.references, { prefixCaption: opt.prefixCaption })
		.pipe(mdproc.states)
		.pipe(preProcess)
		();
};

gulp.task('autograph:svg', function () {
	var tasks = _.map(graphs.autograph.sources, function (g) {
		return gulp.src(g.sourceFile)
			.pipe(markdownPipeline({ prefixCaption: true }))
			.pipe(mdproc.autograph(g.options))
			.pipe(rename({ basename: g.name }))
			.pipe(gulp.dest(graphs.autograph.target));
	});
	return es.concat.apply(null, tasks);
});

gulp.task('images:svg', ['copy-images', 'autograph:svg']);

gulp.task('html', 'Build the HTML output', ['images:svg'], function () {
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: true }))
		.pipe(mdproc.md2html({ basePath: 'src' }))
		.pipe(gulp.dest(cfg.target_dir));
});

gulp.task('docx', 'Build the DOCX output', function () {
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: true }))
		.pipe(mdproc.md2docx())
		.pipe(gulp.dest(cfg.target_dir));
});
<% if (supportPdf) { %>
gulp.task('tex', 'Build the TeX output', ['copy-images'], function () {
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: false }))
		.pipe(mdproc.md2tex())
		.pipe(gulp.dest(cfg.target_dir));
});

gulp.task('pdf', 'Build the PDF output', function () {
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: false }))
		.pipe(mdproc.md2pdf())
		.pipe(gulp.dest(cfg.target_dir));
});
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
