'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var process = require('process');

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

module.exports = yeoman.generators.Base.extend({
	prompting: function () {
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
				default: this.appname,
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
				name: 'supportPdf',
				message: 'Do you need support for PDF generation',
				default: true,
				store: true
			}
		];

		this.prompt(prompts, function (props) {
			props.projectSubTitle = 'Documentation';
			props.needsGlob = false;
			props.needsDateFormat = false;
			props.needsExec = false;

			if (props.projectType === 'Demo') {
				props.projectSubTitle = 'MdProc Features';
			} else if (props.projectType === 'Personal Log') {
				props.projectSubTitle = 'One Entry every Day'
				props.needsGlob = true;
				props.needsDateFormat = true;
			}

			this.props = props;
			// To access props later use this.props.someOption;
			done();
		}.bind(this));
	},

	writing: {
		app: function () {
			copyTpl(this, '_package.json', 'package.json');
			copy(this, '_yo-rc.json', '.yo-rc.json');
			copy(this, '_gitignore', '.gitignore');
			copy(this, 'editorconfig', '.editorconfig');
			copy(this, 'sublime-project.json', this.props.projectName + '.sublime-project');
			copy(this, 'vscode_tasks.json', '.vscode/tasks.json');
		},

		projectfiles: function () {

			copyTpl(this, 'README.md', 'README.md');
			copyTpl(this, 'LICENSE.md', 'LICENSE.md');
			copyTpl(this, '_gulpfile.js', 'gulpfile.js');
			copyTpl(this, 'mdproc.json', 'config/mdproc.json');

			if (this.props.projectType === 'Demo') {
				copyTpl(this, 'demo/mainfiles', 'config/mainfiles');
				copyTpl(this, 'demo/graphs.json', 'config/graphs.json');
				copyTpl(this, 'demo/preprocessing.js', 'config/preprocessing.js');
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
			} else if (this.props.projectType === 'Personal Log') {
				copyTpl(this, 'personal-log/mainfiles', 'config/mainfiles');
				copyTpl(this, 'graphs.json', 'config/graphs.json');
				copyTpl(this, 'personal-log/preprocessing.js', 'config/preprocessing.js');
				copyTpl(this, 'personal-log/index.md', 'src/index.md');
				copyTpl(this, 'personal-log/todo.md', 'src/inc/todo.md');
			} else {
				copyTpl(this, 'mainfiles', 'config/mainfiles');
				copyTpl(this, 'graphs.json', 'config/graphs.json');
				copyTpl(this, 'preprocessing.js', 'config/preprocessing.js');
				copyTpl(this, 'index.md', 'src/index.md');
			}
		}
	},

	install: function () {
		this.npmInstall();
	},

	end: function () {
		if (this.props.projectType === 'Personal Log') {
			this.spawnCommand('gulp', ['today']);
		}
	}
});
