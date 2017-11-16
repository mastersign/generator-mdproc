/* globals require */

var os = require('os');
var path = require('path');
var process = require('process');
var fs = require('fs');
var del = require('del');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var gulp = require('gulp-help')(require('gulp'));
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');
var connect = require('connect');
var serverStatic = require('serve-static');
var opn = require('opn');
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
		.pipe(preProcess, {cfg: cfg})
		();
};

var graphextract = function (prefixCaption, imgFormat, cb) {
	if (graphs.autograph.sources.length > 0) {
		var tasks = _.map(graphs.autograph.sources, function (g) {
			var opt = _.assign(
				{ imgFormat: imgFormat },
				g.options);
			return gulp.src(g.sourceFile)
				.pipe(markdownPipeline({ prefixCaption: prefixCaption }))
				.pipe(mdproc.autograph(opt))
				.pipe(rename({ basename: g.name }))
				.pipe(gulp.dest(graphs.autograph.target));
		});
		return es.concat.apply(null, tasks);
	} else {
		cb();
	}
};

var dotex = function (prefixCaption, imgFormat, cb) {
	if (graphs.dotex.sources.length) {
		var tasks = _.map(graphs.dotex.sources, function (g) {
			var opt = _.assign(
				{ imgFormat: imgFormat },
				g.options);
			return gulp.src(g.sourceFile)
				.pipe(markdownPipeline({ prefixCaption: prefixCaption }))
				.pipe(mdproc.dotex(opt))
				.pipe(rename({ basename: g.name }))
				.pipe(gulp.dest(graphs.dotex.target));
		});
		return es.concat.apply(null, tasks);
	} else {
		cb();
	}
};

gulp.task('clean', 'Remove all generated output', function () {
	del.sync(cfg.target_dir);
	if (graphs.autograph.target) {
		del.sync(graphs.autograph.target);
	}
	if (graphs.dotex.target) {
		del.sync(graphs.dotex.target);
	}
});

gulp.task('copy-images', false, function () {
	return gulp.src(cfg.image_files, { base: 'src' })
		.pipe(gulp.dest(cfg.target_dir));
});

gulp.task('autograph:svg', false, function (cb) { return graphextract(true, 'svg', cb); });

gulp.task('autograph:png', false, function (cb) { return graphextract(true, 'png', cb); });
<% if (supportPdf) { %>
gulp.task('autograph:pdf', false, function (cb) { return graphextract(false, 'pdf', cb); });
<% } %>
gulp.task('dotex:svg', false, function (cb) { return dotex(true, 'svg', cb); });

gulp.task('dotex:png', false, function (cb) { return dotex(true, 'png', cb); });
<% if (supportPdf) { %>
gulp.task('dotex:pdf', false, function (cb) { return dotex(true, 'pdf', cb); });
<% } %>
gulp.task('images:svg', false, function (cb) {
	runSequence(
		['autograph:svg', 'dotex:svg'],
		'copy-images',
		cb);
});

gulp.task('images:png', false, function (cb) {
	runSequence(
		['autograph:png', 'dotex:png'],
		'copy-images',
		cb);
});
<% if (supportPdf) { %>
gulp.task('images:pdf', false, function (cb) {
	runSequence(
		['autograph:pdf', 'dotex:pdf'],
		'copy-images',
		cb);
});
<% } %>
gulp.task('html', 'Build the HTML output', ['images:svg'], function () {
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: true }))
		.pipe(mdproc.md2html(_.assign({ basePath: 'src' }, cfg.md2html_options)))
		.pipe(gulp.dest(cfg.target_dir))
        .pipe(livereload());
});

gulp.task('docx', 'Build the DOCX output', ['images:png'], function () {
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: true }))
		.pipe(mdproc.md2docx(cfg.md2docx_options))
		.pipe(gulp.dest(cfg.target_dir));
});
<% if (supportPdf) { %>
gulp.task('tex', 'Build the TeX output', ['images:pdf'], function () {
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: false }))
		.pipe(mdproc.md2tex(cfg.md2tex_options || cfg.md2pdf_options))
		.pipe(gulp.dest(cfg.target_dir));
});

gulp.task('pdf', 'Build the PDF output', ['images:pdf'], function () {
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: false }))
		.pipe(mdproc.md2pdf(cfg.md2pdf_options))
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
		function () {
            try {
                gulp.start('autobuild');
            } catch(err) {
                console.log('ERROR: ' + err.message);
            }
        });
});

gulp.task('open-main-file', 'Show the HTML result of the main file in the default browser', function () {
	opn(path.resolve(path.join(process.cwd(), cfg.target_dir, cfg.main + '.html')),
		cfg.default_browser ? { app: cfg.default_browser } : undefined);
});

gulp.task('open-main-in-browser', 'Show the livereload URL of the main file in the default browser', function () {
    opn('http://localhost:' + cfg.server_port + '/' + cfg.main + '.html',
        cfg.default_browser ? { app: cfg.default_browser } : undefined);
});

gulp.task('serve', 'Show HTML in default browser and refresh on changes',
	['autobuild'], function () {

    var server = connect();
    server.use(serverStatic(cfg.target_dir));
    server.listen(cfg.server_port);
    livereload.listen();
    watch(cfg.watched_files,
        { verbose: true, readDelay: 200},
		function () {
            try {
                gulp.start('autobuild');
            } catch(err) {
                console.log('ERROR: ' + err.message);
            }
        });
});

gulp.task('default', 'Build the output in the default formats',
	['autobuild']);
