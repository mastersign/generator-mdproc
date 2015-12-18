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
        type: 'list',
        name: 'projectType',
        message: 'Which kind of project do you want?',
        choices: ['Minimal', 'Personal Log'],
        default: 0
      },
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
      props.projectSubTitle = 'Documentation';
      props.needsGlob = false;
      props.needsLodash = false;
      props.needsExec = false;
      props.needsRename = false;
      props.needsRunSequence = false;
      props.needsDateFormat = false;
      if (props.projectType === 'Personal Log') {
        props.projectSubTitle = 'One Entry every Day'
        props.needsGlob = true;
        props.needsLodash = true;
        props.needsRunSequence = true;
        props.needsDateFormat = true;
      }
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
      this.fs.copy(
        this.templatePath('_gitignore'),
        this.destinationPath('.gitignore')
      );
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
      this.fs.copy(
        this.templatePath('sublime-project.json'),
        this.destinationPath(this.props.projectName + '.sublime-project')
      );
      this.fs.copy(
        this.templatePath('vscode_tasks.json'),
        this.destinationPath('.vscode/tasks.json')
      );
   },

    projectfiles: function () {

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
          this.templatePath('preprocessing.js'),
          this.destinationPath('config/preprocessing.js'),
          this.props
      );

      if (this.props.projectType === 'Personal Log') {
        this.fs.copyTpl(
          this.templatePath('personal-log/mainfiles'),
          this.destinationPath('config/mainfiles'),
          this.props
        );
        this.fs.copyTpl(
          this.templatePath('personal-log/mdproc.json'),
          this.destinationPath('config/mdproc.json'),
          this.props
        );
        this.fs.copyTpl(
          this.templatePath('personal-log/index.md'),
          this.destinationPath('src/index.md'),
          this.props
        );
        this.fs.copyTpl(
          this.templatePath('personal-log/todo.md'),
          this.destinationPath('src/inc/todo.md'),
          this.props
        );
      } else {
        this.fs.copyTpl(
          this.templatePath('mainfiles'),
          this.destinationPath('config/mainfiles'),
          this.props
        );
        this.fs.copyTpl(
          this.templatePath('mdproc.json'),
          this.destinationPath('config/mdproc.json'),
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
