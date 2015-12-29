/* globals require, module */

module.exports = function (mdtext) {
	// here you can modify mdtext to change the Markdown source
	// before compiling it with Pandoc

	// E.g. add a copyright footer to all documents
	var packageInfo = require('../package.json');
	var copyright = "Copyright &copy; by " +
		"[" + packageInfo.author.name + "](mailto:" +
		packageInfo.author.email + ") " +
		"(<%= (new Date()).getFullYear() %>).";
	var lastChange = "Document compiled at " + (new Date()).toDateString() + ".";
	mdtext = mdtext + "\n\n-----\n\n" + copyright + "  \n" + lastChange + "\n";

	return mdtext;
};
