'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var process = require('process');
var fs = require('fs');

module.exports = yeoman.generators.Base.extend({
  prompting: function () {
    var done = this.async();

    this.log(yosay(
      'Creating a ' + chalk.red('Markdown Project') + ' just for you!'
    ));

    var prompts = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Your project name',
        default: this.appname,
        validate: function (v) { return v.indexOf(" ") == -1; },
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
        default: process.env['USER'],
        store: true
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'The email of the author',
        default: process.env['MAIL'],
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
      this.props = props;
      // To access props later use this.props.someOption;
      done();
    }.bind(this));
  },

  writing: {
    app: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        this.props
      );
      this.fs.copy(
        this.templatePath('_yo-rc.json'),
        this.destinationPath('.yo-rc.json')
      );
      this.fs.copyTpl(
        this.templatePath('sublime-project.json'),
        this.destinationPath(this.props.projectName + '.sublime-project')
      );
    },

    projectfiles: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
      this.fs.copy(
        this.templatePath('vscode_tasks.json'),
        this.destinationPath('.vscode/tasks.json')
      );
      this.fs.copyTpl(
        this.templatePath('README.md'),
        this.destinationPath('README.md'),
        this.props
      );
      this.fs.copyTpl(
        this.templatePath('LICENSE.md'),
        this.destinationPath('LICENSE.md'),
        this.props
      );
      this.fs.copyTpl(
        this.templatePath('_gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        this.props
      );
      this.fs.copyTpl(
        this.templatePath('_config.json'),
        this.destinationPath('config.json'),
        this.props
      );
      this.fs.copyTpl(
        this.templatePath('index.md'),
        this.destinationPath('src/index.md'),
        this.props
      );
      this.fs.copyTpl(
        this.templatePath('chapter_one.inc.md'),
        this.destinationPath('src/chapters/one.inc.md'),
        this.props
      );
    }
  },

  install: function () {
    this.npmInstall();
  }
});
