/* globals require */
/* jshint esversion: 6 */

const os = require('os');
const path = require('path');
const process = require('process');
const fs = require('fs');
const del = require('del');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const gulp = require('gulp');
const help = require('gulp-help-four');
const gulpWatch = require('gulp-watch');
const livereload = require('gulp-livereload');
const connect = require('connect');
const serverStatic = require('serve-static');
const opn = require('opn');
const rename = require('gulp-rename');
const textTransform = require('gulp-text-simple');
const lazypipe = require('lazypipe');
const merge = require('merge-stream');
const mdproc = require('mdproc');
const mdinclude = require('mdinclude');
const mdquery = require('mdquery').transform;
<% if (needsGlob) { %>var glob = require('glob');
<% } if (needsDateFormat) { %>var dateFormat = require('dateformat');
<% } if (needsExec) { %>var exec = require('gulp-exec');
<% } %>
help(gulp, { hideEmpty: true });

const preProcess = textTransform(require('./config/preprocessing.js'));
const htmlPostProcess = textTransform(require('./config/html-postprocessing.js'));
var injectLiveReload = false;

function setTerminalTitle(title) {
	process.stdout.write(String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7));
}

function loadConfig() {
	return JSON.parse(fs.readFileSync('./config/mdproc.json', 'utf8'));
}

function loadGraphs() {
	return JSON.parse(fs.readFileSync('./config/graphs.json', 'utf8'));
}

function runTask(taskFn) {
	taskFn(function () {});
}

function markdownPipeline(opt) {
	var cfg = loadConfig();
	return lazypipe()
		.pipe(mdinclude)
		.pipe(mdquery)
		.pipe(mdproc.references, { prefixCaption: opt.prefixCaption })
		.pipe(mdproc.badges)
		.pipe(preProcess, {cfg: cfg})
		();
}

function graphextract(prefixCaption, imgFormat, cb) {
	var graphs = loadGraphs();
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
		return merge(tasks);
	} else {
		cb();
	}
}

function dotex(prefixCaption, imgFormat, cb) {
	var graphs = loadGraphs();
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
		return merge(tasks);
	} else {
		cb();
	}
}

function clean(cb) {
	var cfg = loadConfig();
	del.sync(cfg.target_dir);

	var graphs = loadGraphs();
	if (graphs.autograph.target) {
		del.sync(graphs.autograph.target);
	}
	if (graphs.dotex.target) {
		del.sync(graphs.dotex.target);
	}
	cb();
}

function copyImages() {
	var cfg = loadConfig();
	return gulp.src(cfg.image_files, { base: 'src' })
		.pipe(gulp.dest(cfg.target_dir));
}

function autographSvg(cb) { return graphextract(true, 'svg', cb); }
function dotexSvg(cb) { return dotex(true, 'svg', cb); }
const imagesSvg = gulp.parallel(autographSvg, dotexSvg);

function autographPng(cb) { return graphextract(true, 'png', cb); }
function dotexPng(cb) { return dotex(true, 'png', cb); }
const imagesPng = gulp.parallel(autographPng, dotexPng);
<% if (supportPdf) { %>
function autographPdf(cb) { return graphextract(false, 'pdf', cb); }
function dotexPdf(cb) { return dotex(true, 'pdf', cb); }
const imagesPdf = gulp.parallel(autographPdf, dotexPdf);
<% } %>
function html() {
	var cfg = loadConfig();
	cfg.injectLiveReload = injectLiveReload;
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: true }))
		.pipe(mdproc.md2html(_.assign({ basePath: 'src' }, cfg.options, cfg.md2html_options)))
		.pipe(htmlPostProcess({cfg: cfg}))
		.pipe(gulp.dest(cfg.target_dir))
		.pipe(livereload());
}

function docx() {
	var cfg = loadConfig();
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: true }))
		.pipe(mdproc.md2docx(_.assign({}, cfg.options, cfg.md2docx_options)))
		.pipe(gulp.dest(cfg.target_dir));
}
<% if (supportPdf) { %>
function tex() {
	var cfg = loadConfig();
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: false }))
		.pipe(mdproc.md2tex(_.assign({}, cfg.options, cfg.md2tex_options || cfg.md2pdf_options)))
		.pipe(gulp.dest(cfg.target_dir));
}

function pdf() {
	var cfg = loadConfig();
	return gulp.src(cfg.markdown_files)
		.pipe(markdownPipeline({ prefixCaption: false }))
		.pipe(mdproc.md2pdf(_.assign({}, cfg.options, cfg.md2pdf_options)))
		.pipe(gulp.dest(cfg.target_dir));
}
<% } %>
const formatTasks = {
	'html': gulp.series(imagesSvg, copyImages, html),
	'docx': gulp.series(imagesPng, copyImages, docx),
<% if (supportPdf) { %>	'tex': gulp.series(imagesPdf, copyImages, tex),
	'pdf': gulp.series(imagesPdf, copyImages, pdf)
<% } %>};

const all =
	gulp.series(
		gulp.parallel(imagesSvg, imagesPng<% if (supportPdf) { %>, imagesPdf<% } %>),
		copyImages,
		gulp.series(html, docx<% if (supportPdf) { %>, tex, pdf<% } %>));

const autobuildTasks =
	_.map(loadConfig().default_formats,
		function(taskName) { return formatTasks[taskName]; });
const autobuild = _.spread(gulp.series)(autobuildTasks);

function openMainFile(cb) {
	const cfg = loadConfig();
	opn(path.resolve(path.join(process.cwd(), cfg.target_dir, cfg.main + '.html')),
		cfg.default_browser ? { app: cfg.default_browser } : undefined);
	cb();
}

function watch() {
	setTerminalTitle('MdProc watch - ' + __dirname);
	const cfg = loadConfig();
	return watch(cfg.watched_files,
		{ verbose: true, readDelay: 200 },
		function () {
			try {
				runTask(autobuild);
			} catch(err) {
				console.log('ERROR: ' + err.message);
			}
		});
}

function openLivereload(cb) {
	const cfg = loadConfig();
	opn('http://localhost:' + cfg.server_port + '/' + cfg.main + '.html',
		cfg.default_browser ? { app: cfg.default_browser } : undefined);
	cb();
}

function serve() {
	setTerminalTitle('MdProc serve - ' + __dirname);
	const cfg = loadConfig();
	injectLiveReload = true;
	runTask(html);
	const server = connect();
	server.use(serverStatic(cfg.target_dir));
	server.listen(cfg.server_port);
	livereload.listen({ port: cfg.livereload_port });
	setTimeout(function () { runTask(openLivereload); }, 1000);
	return gulpWatch(cfg.watched_files,
		{ verbose: true, readDelay: 200},
		function () {
			try {
				runTask(gulp.series(imagesSvg, copyImages, html));
			} catch(err) {
				console.log('ERROR: ' + err.message);
			}
		});
}

gulp.task('default', 'Build the output in the default formats', autobuild);
gulp.task('clean', 'Remove all generated output', clean);
gulp.task('copy-images', false, copyImages);
gulp.task('autograph:svg', false, autographSvg);
gulp.task('dotex:svg', false, dotexSvg);
gulp.task('images:svg', false, imagesSvg);
gulp.task('autograph:png', false, autographPng);
gulp.task('dotex:png', false, dotexPng);
gulp.task('images:png', false, imagesPng);
<% if (supportPdf) { %>gulp.task('autograph:pdf', false, autographPdf);
gulp.task('dotex:pdf', false, dotexPdf);
gulp.task('images:pdf', false, imagesPdf);
<% } %>gulp.task('html', 'Build the HTML output', gulp.series(imagesSvg, copyImages, html));
gulp.task('docx', 'Build the DOCX output', gulp.series(imagesPng, copyImages, docx));
<% if (supportPdf) { %>gulp.task('tex', 'Build the TeX output', gulp.series(imagesPdf, copyImages, tex));
gulp.task('pdf', 'Build the PDF output', gulp.series(imagesPdf, copyImages, pdf));
<% } %>gulp.task('all', 'Build the output in all formats', all);
gulp.task('autobuild', false, autobuild);
gulp.task('watch', 'Watch the source files and build automatically', gulp.series(autobuild, watch));
gulp.task('open-main-file', 'Show the HTML result of the main file in the default browser', openMainFile);
gulp.task('open-livereload', 'Show the livereload URL of the main file in the default browser', openLivereload);
gulp.task('serve', 'Show HTML in default browser and refresh on changes', gulp.series(imagesSvg, copyImages, serve));

<% if (projectType === 'Personal Log') { %>
function today(cb) {
	const now = new Date();
	const yearDir = path.join('src', 'log', dateFormat(now, 'yyyy'));
	const monthDir = path.join(yearDir, dateFormat(now, 'mm'));
	const entryFile = path.join(monthDir, dateFormat(now, 'yyyy-mm-dd') + '.md');
	const headline = '## ' + dateFormat('yyyy-mm-dd dddd') +
		' {#log_' + dateFormat('yyyy-mm-dd') + '}';
	const text = headline + os.EOL + os.EOL;
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
}
gulp.task('today', 'Create a new file for todays entries', today);
<% } %>