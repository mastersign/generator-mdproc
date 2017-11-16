<%= projectName %>
<%= new Array(projectName.length + 1).join("=") %>

> <%= projectDescription %>

Project Automation
------------------

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
* **help**  
  Shows all tasks with thier description.
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
<% } %>* **clean**  
  Deletes all generated documents and images.
* **open-main-filw**  
  Shows the HTML result from the main document in the default browser.
* **serve**  
  Runs a statric HTTP server for the output directory,
  and starts a _livereload_ server for automatic reloads in the browser.
* **open-main-in-browser**  
  Shows the main file, delivered by _serve_, in the default browser.

[Gulp]: http://gulpjs.com "the streaming build system"
