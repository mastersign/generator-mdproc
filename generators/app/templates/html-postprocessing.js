/* globals require, module */

module.exports = function (htmltext, opts) {
	// here you can modify htmltext to change the HTML code
	// after compiling it with Pandoc

	/*
	 * inject live-reload code
	 */
    if (opts.cfg.injectLiveReload) {
    	var liveReloadSnippet = "<script>document.write('<script src=\"http://'" +
        	"+ (location.host || 'localhost').split(':')[0]" +
        	"+ ':" + opts.cfg.livereload_port + "/livereload.js?snipver=1\"></'" +
        	"+ 'script>')</script>"
        htmltext = htmltext.replace("</body>", liveReloadSnippet + "\n</body>");
    }

	return htmltext;
};
