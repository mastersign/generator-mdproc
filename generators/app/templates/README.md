<%= projectName %>
<%= new Array(projectName.length + 1).join("=") %>

> <%= projectDescription %>

Project Automation
------------------

In _Visual Studio Code_ you can use `Ctrl+Shift+B` to run the `autobuild` task.

This project is automated with [Gulp] tasks.

You can run a task by typing the following command at the shell:

``` sh
gulp <task>
```

Replace `<task>` with the name of the task your want to run.

Tasks
-----

The following [Gulp] tasks are available.

* **autobuild** (default)  
  Builds the documents in the default formats (`config.json`: `default_formats`).
* **watch**  
  Watches the source files and runs the task _autobuild_ if one file changes.
* **html**  
  Generates the documents in HTML format.
* **docx**  
  Generates the documents in DOCX format.
<% if (supportPdf) { %>* **pdf**  
  Generates the documents in PDF format.
<% } %>* **all**  
  Generates the documents in all formats.
<% if (projectType === 'Personal Log') { %>* **today**  
  Creates a log entry for today.
<% } %>

[Gulp]: http://gulpjs.com "the streaming build system"
