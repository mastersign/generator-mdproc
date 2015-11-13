/* globals require */

var path = require('path');
var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var watch = require('gulp-watch');
var mdproc = require('mdproc');

var cfg = require('./config.json');

var preProcess = function(mdtext) {
	// here you can modify mdtext to change the Markdown source
	// before compiling it with Pandoc

	// E.g. add a copyright footer to all documents
	var copyright = "Copyright &copy; by " +
		"[<%= authorName %>](mailto:<%= authorEmail %>) " +
		"(<%= (new Date()).getFullYear() %>).";
	var lastChange = "Document compiled at " + (new Date()).toDateString() + ".";
	mdtext = mdtext + "\n\n-----\n\n" + copyright + "  \n" + lastChange + "\n";

	return mdtext;
};

gulp.task('prepare-target-dir', function () {
	if (!fs.existsSync(cfg.target_dir)) {
		fs.mkdirSync(cfg.target_dir);
	}
});

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
