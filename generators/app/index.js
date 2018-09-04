'use strict';
var Generator = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var copy = function (that, templatePath, targetPath) {
	that.fs.copy(
		that.templatePath(templatePath),
		that.destinationPath(targetPath));
};

var copyTpl = function (that, templatePath, targetPath) {
	that.fs.copyTpl(
		that.templatePath(templatePath),
		that.destinationPath(targetPath),
		that.props);
};

module.exports = class extends Generator {
	prompting () {
		var done = this.async();

		this.log(yosay(
			'Creating a ' + chalk.red('Markdown Project') + ' just for you!'
		));

		var prompts = [
			{
				type: 'list',
				name: 'projectType',
				message: 'Which kind of project do you want?',
				choices: ['Minimal', 'Demo', 'Personal Log'],
				default: 0
			},
			{
				type: 'input',
				name: 'projectName',
				message: 'Your project name',
				default: this.appname.replace(' ', '-'),
				validate: function (v) { return v.indexOf(' ') === -1; },
				store: true
			},
			{
				type: 'input',
				name: 'projectTitle',
				message: 'Your main documents title',
				default: 'Untitled',
				store: true
			},
			{
				type: 'input',
				name: 'projectDescription',
				message: 'A brief description of your project',
				default: 'An informative documentation project',
				store: true
			},
			{
				type: 'input',
				name: 'authorName',
				message: 'The name of the author',
				default: process.env.USER,
				store: true
			},
			{
				type: 'input',
				name: 'authorEmail',
				message: 'The email of the author',
				default: process.env.MAIL,
				store: true
			},
			{
				type: 'confirm',
				name: 'supportCitation',
				message: 'Do you need support for citations',
				default: true,
				store: true
			},
			{
				type: 'confirm',
				name: 'supportPdf',
				message: 'Do you need support for PDF generation',
				default: true,
				store: true
			},
			{
				type: 'confirm',
				name: 'platformPdfFonts',
				message: 'Do you want to use custom fonts in PDFs',
				default: false,
				store: true,
				when: function (props) { return props.supportPdf; }
			},
			{
				type: 'list',
				name: 'htmlTheme',
				message: 'HTML theme',
				choices: ['Default', 'Metro', 'Roboto', 'Science'],
				default: 0
			}
		];

		return this.prompt(prompts).then(function (props) {
			props.projectSubTitle = 'Documentation';
			props.needsGlob = false;
			props.needsDateFormat = false;
			props.needsExec = false;

			if (props.projectType === 'Demo') {
				props.projectSubTitle = 'MdProc Features';
			} else if (props.projectType === 'Personal Log') {
				props.projectSubTitle = 'One Entry every Day';
				props.needsGlob = true;
				props.needsDateFormat = true;
			}

			this.props = props;
			// To access props later use this.props.someOption;
			done();
		}.bind(this));
	}

	writing() {

		// app
		copyTpl(this, '_package.json', 'package.json');
		copy(this, '_yo-rc.json', '.yo-rc.json');
		copy(this, '_gitignore', '.gitignore');
		copy(this, 'editorconfig', '.editorconfig');
		copy(this, 'sublime-project.json', this.props.projectName + '.sublime-project');

		// project files
		copyTpl(this, 'README.md', 'README.md');
		copyTpl(this, 'LICENSE.md', 'LICENSE.md');
		copyTpl(this, '_gulpfile.js', 'gulpfile.js');
		copyTpl(this, 'mdproc.json', 'config/mdproc.json');

		if (this.props.projectType === 'Demo') {
			copyTpl(this, 'demo/mainfiles', 'config/mainfiles');
			copyTpl(this, 'demo/graphs.json', 'config/graphs.json');
			copyTpl(this, 'demo/preprocessing.js', 'config/preprocessing.js');
			copyTpl(this, 'html-postprocessing.js', 'config/html-postprocessing.js');
			copyTpl(this, 'demo/index.md', 'src/index.md');
			copy(this, 'demo/includes.inc.md', 'src/inc/includes.md');
			copy(this, 'demo/table1.csv', 'src/data/table1.csv');
			copy(this, 'demo/example.js', 'src/code/example.js');
			copy(this, 'demo/images.inc.md', 'src/inc/images.md');
			copy(this, 'demo/workbench.jpg', 'src/img/workbench.jpg');
			copy(this, 'demo/query.inc.md', 'src/inc/query.md');
			copy(this, 'demo/data.inc.md', 'src/inc/data.md');
			copy(this, 'demo/graph.inc.md', 'src/inc/graph.md');
			copy(this, 'demo/relations.inc.md', 'src/inc/relations.md');
			copy(this, 'demo/links.inc.md', 'src/inc/links.md');
			copy(this, 'demo/badges.inc.md', 'src/inc/badges.md');
			if (this.props.supportCitation) {
				copy(this, 'demo/citations.inc.md', 'src/inc/citations.md');
			}
		} else if (this.props.projectType === 'Personal Log') {
			copyTpl(this, 'personal-log/mainfiles', 'config/mainfiles');
			copyTpl(this, 'graphs.json', 'config/graphs.json');
			copyTpl(this, 'personal-log/preprocessing.js', 'config/preprocessing.js');
			copyTpl(this, 'html-postprocessing.js', 'config/html-postprocessing.js');
			copyTpl(this, 'personal-log/index.md', 'src/index.md');
			copyTpl(this, 'personal-log/todo.md', 'src/inc/todo.md');
		} else {
			copyTpl(this, 'mainfiles', 'config/mainfiles');
			copyTpl(this, 'graphs.json', 'config/graphs.json');
			copyTpl(this, 'preprocessing.js', 'config/preprocessing.js');
			copyTpl(this, 'html-postprocessing.js', 'config/html-postprocessing.js');
			copyTpl(this, 'index.md', 'src/index.md');
		}
		if (this.props.supportCitation) {
			copy(this, 'citation-styles/ieee-with-url.csl', 'res/ieee-with-url.csl');
			copy(this, 'citation-styles/acm-sig-proceedings.csl', 'res/acm-sig-proceedings.csl');
			copy(this, 'citation-styles/acm-sigchi-proceedings.csl', 'res/acm-sigchi-proceedings.csl');
			copy(this, 'citation-styles/acm-siggraph.csl', 'res/acm-siggraph.csl');
			copy(this, 'citation-styles/springer.csl', 'res/springer.csl');
			copy(this, 'citation-styles/springer-numeric.csl', 'res/springer-numeric.csl');
			copy(this, 'citation-styles/din-1505-2.csl', 'res/din-1505-2.csl');
			copy(this, 'citation-styles/din-1505-2-alphanumeric.csl', 'res/din-1505-2-alphanumeric.csl');
			copy(this, 'citation-styles/din-1505-2-numeric.csl', 'res/din-1505-2-numeric.csl');
			copy(this, 'citation-styles/din-1505-2-numeric-alphabetical.csl', 'res/din-1505-2-numeric-alphabetical.csl');
			copy(this, 'citation-styles/springer-numeric.csl', 'res/springer-numeric.csl');
			copy(this, 'references.bib', 'src/references.bib');
		}
	}

	install () {
		this.npmInstall();
	}

	end () {
		if (this.props.projectType === 'Personal Log') {
			this.spawnCommand('gulp', ['today']);
		}
	}
};
